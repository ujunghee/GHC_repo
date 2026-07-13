import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  createAssistantMessage,
  createImageMatchAssistantMessage,
  getSuggestionLabels,
  panelCollapseDelay,
  panelDefaultWidth,
  panelMaxWidth,
  panelMinWidth,
  sourceDocument,
  getRightPanelMaxWidth,
  getRightPanelDefaultWidth,
  getRightPanelWidth,
  sourcePanelMinWidth,
} from "./data";
import type { ChatMessage, ChatPageProps, DrawingCandidate, RightPanelMode } from "./types";
import { reportData } from "../report-search/data";
import { buildGroupedReports, filterReportsByKeyword } from "../report-search/searchUtils";
import { springSoft, tapScale } from "../report-search/motionConfig";
import { ChatConversation } from "./components/ChatConversation";
import { ChatSearchModal } from "./components/ChatSearchModal";
import { MapPanel, type MapOverlayRequest } from "./components/MapPanel";
import { ReportChatSidePanel } from "./components/ReportChatSidePanel";
import { ResizeHandle } from "./components/ResizeHandle";
import { SourcePanel } from "./components/SourcePanel";

export function ChatPage({ reports, onBack }: ChatPageProps) {
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(panelDefaultWidth);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const [isPanelResizeHover, setIsPanelResizeHover] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("none");
  const [lastRightPanelMode, setLastRightPanelMode] = useState<Exclude<RightPanelMode, "none">>("source");
  const [sourcePanelWidth, setSourcePanelWidth] = useState(() =>
    getRightPanelWidth(typeof window === "undefined" ? 1440 : window.innerWidth, panelDefaultWidth),
  );
  const [isSourcePanelResizing, setIsSourcePanelResizing] = useState(false);
  const [isSourcePanelResizeHover, setIsSourcePanelResizeHover] = useState(false);
  const [activeSourceTitle, setActiveSourceTitle] = useState(sourceDocument.title);
  const [mapOverlayRequest, setMapOverlayRequest] = useState<MapOverlayRequest | null>(null);
  const isRightPanelOpen = rightPanelMode !== "none";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHelperOpen, setSearchHelperOpen] = useState(false);
  const [searchClues, setSearchClues] = useState<string[]>([]);
  const [checkedSearchClues, setCheckedSearchClues] = useState<string[]>([]);
  const [panelReportIds, setPanelReportIds] = useState<number[]>(() => reports.map((report) => report.id));
  const [activeReportIds, setActiveReportIds] = useState<number[]>(() => reports.map((report) => report.id));
  const selectAllRef = useRef<HTMLInputElement>(null);
  const searchHelperPopupRef = useRef<HTMLDivElement>(null);
  const searchResultListRef = useRef<HTMLUListElement>(null);
  const pendingSearchScrollTopRef = useRef<number | null>(null);
  const panelCollapseTimerRef = useRef<number | null>(null);
  const isChatCompact = viewportWidth <= 1100;
  const shouldPreferConversation = viewportWidth <= 1280;

  const panelReports = useMemo(
    () => reportData.filter((report) => panelReportIds.includes(report.id)),
    [panelReportIds],
  );
  const activeReports = useMemo(
    () => reportData.filter((report) => activeReportIds.includes(report.id)),
    [activeReportIds],
  );
  const baseSearchReports = useMemo(
    () => filterReportsByKeyword(reportData, searchQuery),
    [searchQuery],
  );
  const groupedSearchReports = useMemo(
    () => buildGroupedReports(baseSearchReports, checkedSearchClues),
    [baseSearchReports, checkedSearchClues],
  );
  const searchedReports = useMemo(() => {
    return [...baseSearchReports].sort((a, b) => {
      const aChecked = activeReportIds.includes(a.id);
      const bChecked = activeReportIds.includes(b.id);
      if (aChecked === bChecked) return 0;
      return aChecked ? -1 : 1;
    });
  }, [baseSearchReports, activeReportIds]);

  const hasPanelContent = panelReports.length > 0;
  const selectedCount = activeReports.length;
  const activePanelCount = panelReports.filter((report) => activeReportIds.includes(report.id)).length;
  const isAllChecked = panelReports.length > 0 && activePanelCount === panelReports.length;
  const isPartiallyChecked = activePanelCount > 0 && activePanelCount < panelReports.length;
  const reportTitle = activeReports[0]?.title ?? "보고서 선택";
  const suggestionLabels = getSuggestionLabels(activeReports);
  const hasSourceContent = messages.some(
    (item) => item.role === "assistant" && (item.hasEvidence || item.drawingCandidates?.length),
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isChatCompact) {
      setIsPanelOpen(false);
      setIsPanelResizing(false);
      setRightPanelMode("none");
      setIsSourcePanelResizing(false);
      return;
    }

    if (shouldPreferConversation) {
      setRightPanelMode("none");
      setIsSourcePanelResizing(false);
    }
  }, [isChatCompact, shouldPreferConversation]);

  const clearPanelCollapseTimer = () => {
    if (panelCollapseTimerRef.current !== null) {
      window.clearTimeout(panelCollapseTimerRef.current);
      panelCollapseTimerRef.current = null;
    }
  };

  const schedulePanelCollapse = () => {
    if (panelCollapseTimerRef.current !== null) return;
    panelCollapseTimerRef.current = window.setTimeout(() => {
      panelCollapseTimerRef.current = null;
      setIsPanelOpen(false);
      setIsPanelResizing(false);
    }, panelCollapseDelay);
  };

  useEffect(() => {
    const nextReportIds = reports.map((report) => report.id);
    setPanelReportIds(nextReportIds);
    setActiveReportIds(nextReportIds);
    setMessages([]);
    setRightPanelMode("none");
  }, [reports]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isPartiallyChecked;
    }
  }, [isPartiallyChecked]);

  useEffect(() => {
    if (!isPanelResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.clientX < panelMinWidth) {
        setPanelWidth(panelMinWidth);
        schedulePanelCollapse();
        return;
      }

      clearPanelCollapseTimer();
      setPanelWidth(Math.min(panelMaxWidth, Math.max(panelMinWidth, event.clientX)));
    };

    const handlePointerUp = () => setIsPanelResizing(false);
    return bindResizeEvents(handlePointerMove, handlePointerUp);
  }, [isPanelResizing]);

  useEffect(() => {
    if (isChatCompact) return;
    setSourcePanelWidth(getRightPanelWidth(viewportWidth, isPanelOpen ? panelWidth : 0));
  }, [viewportWidth, isChatCompact]);

  useEffect(() => {
    if (isChatCompact) return;
    setSourcePanelWidth((current) =>
      Math.min(current, getRightPanelMaxWidth(viewportWidth, isPanelOpen ? panelWidth : 0)),
    );
  }, [isPanelOpen, panelWidth, viewportWidth, isChatCompact]);

  useEffect(() => {
    if (!isSourcePanelResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      const dynamicMaxWidth = getRightPanelMaxWidth(window.innerWidth, isPanelOpen ? panelWidth : 0);
      setSourcePanelWidth(Math.min(dynamicMaxWidth, Math.max(sourcePanelMinWidth, nextWidth)));
    };

    const handlePointerUp = () => setIsSourcePanelResizing(false);
    return bindResizeEvents(handlePointerMove, handlePointerUp);
  }, [isPanelOpen, isSourcePanelResizing, panelWidth]);

  useEffect(() => {
    if (isPanelOpen) clearPanelCollapseTimer();
  }, [isPanelOpen]);

  useEffect(() => () => clearPanelCollapseTimer(), []);

  useEffect(() => {
    if (!searchHelperOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (searchHelperPopupRef.current?.contains(target)) return;
      if ((event.target as Element).closest?.("[data-chat-filter-trigger]")) return;
      setSearchHelperOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    return () => document.removeEventListener("mousedown", handlePointerDown, true);
  }, [searchHelperOpen]);

  useLayoutEffect(() => {
    if (pendingSearchScrollTopRef.current === null) return;
    if (searchResultListRef.current) {
      searchResultListRef.current.scrollTop = pendingSearchScrollTopRef.current;
    }
    pendingSearchScrollTopRef.current = null;
  }, [searchedReports]);

  const toggleSearchClue = (value: string) => {
    setSearchClues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
    setCheckedSearchClues((current) => current.filter((item) => item !== value));
  };

  const toggleSearchClueChecked = (value: string) => {
    setCheckedSearchClues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const resetSearchClues = () => {
    setSearchClues([]);
    setCheckedSearchClues([]);
  };

  const toggleReport = (reportId: number) => {
    setActiveReportIds((currentIds) => {
      const isSelected = currentIds.includes(reportId);
      if (!isSelected) return [...currentIds, reportId];
      if (currentIds.length <= 1) return currentIds;
      return currentIds.filter((id) => id !== reportId);
    });
  };

  const toggleAllReports = () => {
    setActiveReportIds((currentIds) => {
      const panelIds = panelReports.map((report) => report.id);
      if (panelIds.length === 0) return currentIds;
      if (panelIds.every((id) => currentIds.includes(id))) return [panelIds[0]];
      return Array.from(new Set([...currentIds, ...panelIds]));
    });
  };

  const toggleSearchReport = (reportId: number) => {
    pendingSearchScrollTopRef.current = searchResultListRef.current?.scrollTop ?? null;
    setPanelReportIds((currentIds) => (currentIds.includes(reportId) ? currentIds : [...currentIds, reportId]));
    toggleReport(reportId);
  };

  const removePanelReport = (reportId: number) => {
    if (panelReportIds.length <= 1) return;

    const nextPanelReportIds = panelReportIds.filter((id) => id !== reportId);
    setPanelReportIds(nextPanelReportIds);

    setActiveReportIds((currentIds) => {
      if (!currentIds.includes(reportId)) return currentIds;
      const nextActiveIds = currentIds.filter((id) => id !== reportId);
      return nextActiveIds.length > 0 ? nextActiveIds : [nextPanelReportIds[0]];
    });
  };

  const openSourcePanel = () => {
    if (isChatCompact) return;
    setActiveSourceTitle(activeReports[0]?.title ?? sourceDocument.title);
    setLastRightPanelMode("source");
    setRightPanelMode("source");
  };

  const openMapPanel = (candidate?: DrawingCandidate) => {
    if (isChatCompact) return;

    if (candidate) {
      setMapOverlayRequest({
        requestId: `${candidate.id}-${Date.now()}`,
        candidateId: candidate.id,
        imageUrl: candidate.mapOverlayImageUrl ?? "./image/sample/report-page-map.svg",
        title: candidate.title,
        reportTitle: candidate.reportTitle,
        pageLabel: candidate.pageLabel,
      });
    } else {
      setMapOverlayRequest(null);
    }

    setLastRightPanelMode("map");
    setRightPanelMode("map");
  };

  const closeRightPanel = () => {
    setRightPanelMode("none");
  };

  const toggleRightPanel = () => {
    if (isRightPanelOpen) {
      closeRightPanel();
      return;
    }

    if (lastRightPanelMode === "source") {
      setActiveSourceTitle(activeReports[0]?.title ?? sourceDocument.title);
    }

    setRightPanelMode(lastRightPanelMode);
  };

  const sendMessage = (text: string, imageUrl?: string) => {
    const nextMessage = text.trim();
    if ((!nextMessage && !imageUrl) || activeReports.length === 0) return;

    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        role: "user",
        text: nextMessage,
        ...(imageUrl ? { imageUrl } : {}),
      },
      imageUrl ? createImageMatchAssistantMessage(current.length + 2) : createAssistantMessage(current.length + 2),
    ]);
    setMessage("");
  };

  return (
    <main className="bg-white h-screen overflow-hidden flex">
      <AnimatePresence initial={false}>
        {!isChatCompact && isPanelOpen && hasPanelContent && (
          <ReportChatSidePanel
            width={panelWidth}
            reports={panelReports}
            activeReportIds={activeReportIds}
            isAllChecked={isAllChecked}
            selectAllRef={selectAllRef}
            isResizing={isPanelResizing}
            isResizeHover={isPanelResizeHover}
            onBack={onBack}
            onSearch={() => setIsSearchOpen(true)}
            onToggleAll={toggleAllReports}
            onToggleReport={toggleReport}
            onRemoveReport={removePanelReport}
            onResizeStart={(event) => {
              event.preventDefault();
              setIsPanelResizing(true);
            }}
            onResizeEnter={() => setIsPanelResizeHover(true)}
            onResizeLeave={() => setIsPanelResizeHover(false)}
          />
        )}
      </AnimatePresence>

      <section className="relative flex-1 h-screen overflow-hidden" aria-label="보고서 채팅" style={{ minWidth: 0 }}>
        <AnimatePresence initial={false}>
          {!isChatCompact && !isPanelOpen && hasPanelContent && (
            <motion.button
              className="absolute left-0 bg-white border border-slate-200 radius-md-8 flex align-center justify-center z-index-3"
              type="button"
              aria-label="보고서 패널 펼치기"
              initial={{ opacity: 0, x: -12, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -12, y: "-50%" }}
              transition={springSoft}
              whileTap={tapScale.whileTap}
              onClick={() => {
                setPanelWidth((width) => Math.max(width, panelDefaultWidth));
                setIsPanelOpen(true);
              }}
              style={{ top: "50%", width: "3.2rem", height: "6.4rem", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              <i className="chevron-right-slate-700" aria-hidden="true"></i>
            </motion.button>
          )}
        </AnimatePresence>

        {!isChatCompact && hasSourceContent && (
          <motion.button
            className="absolute top-0 right-16 flex align-center justify-center z-index-2"
            type="button"
            aria-label={isRightPanelOpen ? "오른쪽 패널 접기" : "오른쪽 패널 펼치기"}
            aria-pressed={isRightPanelOpen}
            onClick={toggleRightPanel}
            style={{ top: "2rem" }}
            {...tapScale}
          >
            <i className={isRightPanelOpen ? "layout-right-active-icon" : "layout-right-inactive-icon"} aria-hidden="true"></i>
          </motion.button>
        )}

        <ChatConversation
          reportTitle={reportTitle}
          selectedCount={selectedCount}
          activeReports={activeReports}
          messages={messages}
          suggestionLabels={suggestionLabels}
          message={message}
          onMessageChange={setMessage}
          onSend={sendMessage}
          onOpenSource={openSourcePanel}
          onOpenMap={openMapPanel}
        />
      </section>

      <AnimatePresence initial={false}>
        {!isChatCompact && isRightPanelOpen && hasSourceContent && (
          <motion.aside
            key="right-panel"
            className="relative bg-white border-l border-slate-200 h-screen overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sourcePanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={isSourcePanelResizing ? { duration: 0 } : springSoft}
            style={{ flexShrink: 0 }}
            aria-label={rightPanelMode === "source" ? "원문 보기" : "지도 보기"}
          >
            <ResizeHandle
              side="left"
              label="오른쪽 패널 너비 조절"
              active={isSourcePanelResizing}
              hovered={isSourcePanelResizeHover}
              onPointerDown={(event) => {
                event.preventDefault();
                setIsSourcePanelResizing(true);
              }}
              onMouseEnter={() => setIsSourcePanelResizeHover(true)}
              onMouseLeave={() => setIsSourcePanelResizeHover(false)}
            />
            <div className="h-full w-full overflow-hidden">
              <div className={rightPanelMode === "source" ? "h-full" : "hidden"} aria-hidden={rightPanelMode !== "source"}>
                <SourcePanel embedded title={activeSourceTitle} />
              </div>
              <div className={rightPanelMode === "map" ? "h-full" : "hidden"} aria-hidden={rightPanelMode !== "map"}>
                <MapPanel embedded overlayRequest={mapOverlayRequest} />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <ChatSearchModal
            searchQuery={searchQuery}
            searchHelperOpen={searchHelperOpen}
            searchClues={searchClues}
            checkedSearchClues={checkedSearchClues}
            searchedReports={searchedReports}
            groupedSearchReports={groupedSearchReports}
            activeReportIds={activeReportIds}
            helperPopupRef={searchHelperPopupRef}
            resultListRef={searchResultListRef}
            onClose={() => setIsSearchOpen(false)}
            onQueryChange={setSearchQuery}
            onSubmit={() => setSearchHelperOpen(false)}
            onToggleHelper={() => setSearchHelperOpen((open) => !open)}
            onToggleClue={toggleSearchClue}
            onToggleClueChecked={toggleSearchClueChecked}
            onResetClues={resetSearchClues}
            onToggleReport={toggleSearchReport}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function bindResizeEvents(onMove: (event: PointerEvent) => void, onUp: () => void) {
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  return () => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
}
