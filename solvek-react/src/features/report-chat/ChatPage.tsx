import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  createAssistantMessage,
  getSuggestionLabels,
  panelCollapseDelay,
  panelDefaultWidth,
  panelMaxWidth,
  panelMinWidth,
  sourceDocument,
  sourcePanelDefaultWidth,
  sourcePanelMinWidth,
} from "./data";
import type { ChatMessage, ChatPageProps } from "./types";
import { reportData } from "../report-search/data";
import { springSoft, tapScale } from "../report-search/motionConfig";
import { ChatConversation } from "./components/ChatConversation";
import { ChatSearchModal } from "./components/ChatSearchModal";
import { ReportChatSidePanel } from "./components/ReportChatSidePanel";
import { SourcePanel } from "./components/SourcePanel";

export function ChatPage({ reports, onBack }: ChatPageProps) {
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(panelDefaultWidth);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const [isPanelResizeHover, setIsPanelResizeHover] = useState(false);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [sourcePanelWidth, setSourcePanelWidth] = useState(sourcePanelDefaultWidth);
  const [isSourcePanelResizing, setIsSourcePanelResizing] = useState(false);
  const [isSourcePanelResizeHover, setIsSourcePanelResizeHover] = useState(false);
  const [activeSourceTitle, setActiveSourceTitle] = useState(sourceDocument.title);
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
  const searchedReports = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    const filtered = !keyword
      ? reportData
      : reportData.filter(
          (report) =>
            report.title.toLowerCase().includes(keyword) ||
            report.summary.toLowerCase().includes(keyword) ||
            report.tags.some((tag) => tag.toLowerCase().includes(keyword)),
        );

    return [...filtered].sort((a, b) => {
      const aChecked = activeReportIds.includes(a.id);
      const bChecked = activeReportIds.includes(b.id);
      if (aChecked === bChecked) return 0;
      return aChecked ? -1 : 1;
    });
  }, [searchQuery, activeReportIds]);

  const hasPanelContent = panelReports.length > 0;
  const selectedCount = activeReports.length;
  const activePanelCount = panelReports.filter((report) => activeReportIds.includes(report.id)).length;
  const isAllChecked = panelReports.length > 0 && activePanelCount === panelReports.length;
  const isPartiallyChecked = activePanelCount > 0 && activePanelCount < panelReports.length;
  const reportTitle = activeReports[0]?.title ?? "보고서 선택";
  const suggestionLabels = getSuggestionLabels(activeReports);
  const hasSourceContent = messages.some((item) => item.role === "assistant" && item.hasEvidence);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isChatCompact) {
      setIsPanelOpen(false);
      setIsPanelResizing(false);
      setIsSourcePanelOpen(false);
      setIsSourcePanelResizing(false);
      return;
    }

    if (shouldPreferConversation) {
      setIsSourcePanelOpen(false);
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
    setIsSourcePanelOpen(false);
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
    if (!isSourcePanelResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth = window.innerWidth - event.clientX;
      const reservedChatWidth = 360;
      const openReportPanelWidth = isPanelOpen ? panelWidth : 0;
      const dynamicMaxWidth = Math.max(sourcePanelMinWidth, window.innerWidth - openReportPanelWidth - reservedChatWidth);
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

  const openSourcePanel = () => {
    if (isChatCompact) return;
    setActiveSourceTitle(activeReports[0]?.title ?? sourceDocument.title);
    setIsSourcePanelOpen(true);
  };

  const sendMessage = (text: string) => {
    const nextMessage = text.trim();
    if (!nextMessage || activeReports.length === 0) return;

    setMessages((current) => [
      ...current,
      { id: current.length + 1, role: "user", text: nextMessage },
      createAssistantMessage(current.length + 2),
    ]);
    setMessage("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(message);
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
            aria-label={isSourcePanelOpen ? "원문 패널 접기" : "원문 패널 펼치기"}
            aria-pressed={isSourcePanelOpen}
            onClick={() => {
              if (!activeSourceTitle) setActiveSourceTitle(activeReports[0]?.title ?? sourceDocument.title);
              setIsSourcePanelOpen((open) => !open);
            }}
            style={{ top: "2rem" }}
            {...tapScale}
          >
            <i className={isSourcePanelOpen ? "layout-right-active-icon" : "layout-right-inactive-icon"} aria-hidden="true"></i>
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
          onSubmit={handleSubmit}
          onSend={sendMessage}
          onOpenSource={openSourcePanel}
        />
      </section>

      <AnimatePresence initial={false}>
        {!isChatCompact && isSourcePanelOpen && hasSourceContent && (
          <SourcePanel
            width={sourcePanelWidth}
            title={activeSourceTitle}
            isResizing={isSourcePanelResizing}
            isResizeHover={isSourcePanelResizeHover}
            onResizeStart={(event) => {
              event.preventDefault();
              setIsSourcePanelResizing(true);
            }}
            onResizeEnter={() => setIsSourcePanelResizeHover(true)}
            onResizeLeave={() => setIsSourcePanelResizeHover(false)}
          />
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
