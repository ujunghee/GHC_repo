import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "swiper/css";

import {
  ClueChips,
  EmptyState,
  FilterRail,
  HelperMenu,
  RecentReports,
  RecommendSlider,
  ReportGrid,
  ResultHeader,
} from "./components/ReportSearchSections";
import { reportData } from "./data";
import { fadeEase, springSnappy, springSoft, tapScale } from "./motionConfig";
import type { ViewMode } from "./types";


export function MainSearchPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ViewMode>("default");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [helperOpen, setHelperOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const [checkedClues, setCheckedClues] = useState<string[]>([]);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const helperPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helperOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (helperPopupRef.current?.contains(target)) return;
      if ((event.target as Element).closest?.("[data-filter-trigger]")) return;
      setHelperOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [helperOpen]);

  const toggleClue = (value: string) => {
    setClues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
    setCheckedClues((current) => current.filter((item) => item !== value));
  };

  const toggleClueChecked = (value: string) => {
    setCheckedClues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const shownReports = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (keyword) {
      return reportData.filter(
        (report) =>
          report.title.toLowerCase().includes(keyword) ||
          report.summary.toLowerCase().includes(keyword) ||
          report.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }
    if (mode === "filtered" || mode === "grouped") return reportData.slice(0, 6);
    return reportData;
  }, [mode, query]);

  const recommendedReports = useMemo(() => {
    const keywords = Array.from(
      new Set(
        searchHistory
          .flatMap((term) => term.split(/\s+/))
          .filter((word) => word.length > 1 && !/^[IVXⅠ-Ⅻ]+$/.test(word)),
      ),
    );
    return reportData
      .filter((report) =>
        keywords.some(
          (keyword) =>
            report.title.includes(keyword) ||
            report.summary.includes(keyword) ||
            report.tags.some((tag) => tag.includes(keyword)),
        ),
      )
      .slice(0, 8);
  }, [searchHistory]);

  const handleSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const nextQuery = query.trim();

    if (nextQuery) {
      const keyword = nextQuery.toLowerCase();
      const hasResults = reportData.some(
        (report) =>
          report.title.toLowerCase().includes(keyword) ||
          report.summary.toLowerCase().includes(keyword) ||
          report.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
      if (hasResults) {
        setSearchHistory((current) => [nextQuery, ...current.filter((item) => item !== nextQuery)].slice(0, 5));
      }
    }

    setMode(nextQuery ? "history" : "default");
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((current) => {
      const next = current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter];
      setMode(next.length > 0 ? "grouped" : query.trim() ? "history" : "default");
      return next;
    });
  };

  const chooseRecent = (term: string) => {
    setQuery(term);
    setMode("history");
    setSelectedReports([]);
  };

  const toggleReport = (id: number) => {
    setSelectedReports((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) {
        setToastVisible(true);
        window.setTimeout(() => setToastVisible(false), 1800);
        return current;
      }
      return [...current, id];
    });
  };

  const isEmptyResult = mode === "empty" || (query.trim() !== "" && shownReports.length === 0);
  const resultCount = query.trim() ? shownReports.length : mode === "grouped" || mode === "filtered" ? 3 : reportData.length;
  const heading = mode === "recommend" ? "이번엔 어떤 보고서로 이야기를 나눌까요?" : "대화할 발굴보고서를 선택하거나 입력해보세요";

  useEffect(() => {
    if (!isEmptyResult) return;
    setSelectedReports((current) => (current.length > 0 ? [] : current));
    setToastVisible(false);
  }, [isEmptyResult]);

  return (
    <main className="bg-slate-50 h-screen overflow-auto">
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            key="toast"
            className="toast active bg-red-50 radius-md-8 shadow-lg px-20 py-12 flex align-center gap-8 z-index-10"
            role="status"
            initial={{ opacity: 0, y: -32, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            transition={springSoft}
            style={{ top: "3.2rem", left: "50%", visibility: "visible", transition: "none" }}
          >
            <i className="toast-icon" aria-hidden="true"></i>
            <span className="body1-sb-18 color-red-500">최대 2건만 가능합니다</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mb-default mt-140 py-40" aria-label="발굴보고서 검색">
        <header className="text-center mb-50">
          <h1 className="heading4-b-32 color-slate-900 mb-8">{heading}</h1>
          <p className="body1-m-18 color-slate-500">AI는 선택한 1개 보고서를 기준으로 요약, 위치, 유구·유물 정보를 답변합니다.</p>
        </header>

        <form className="main-search-wrapper relative" onSubmit={handleSearch}>
          <div className="main-search-62 flex align-center gap-8 px-12">
            <motion.button
              className={helperOpen ? "active flex align-center justify-center" : "flex align-center justify-center"}
              type="button"
              aria-label="검색 도우미"
              aria-haspopup="dialog"
              aria-expanded={helperOpen}
              aria-controls="helper-popup"
              data-filter-trigger
              onClick={() => setHelperOpen((open) => !open)}
              {...tapScale}
            >
              <i className={helperOpen ? "filter-icon active" : "filter-icon"} aria-hidden="true"></i>
            </motion.button>
            <input
              id="report-search"
              type="search"
              className="main-search__input body2-r-16 flex-1"
              aria-label="발굴보고서 검색어"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value.trim() && event.target.value.trim() !== "489651") setMode("history");
              }}
              placeholder="“함안의 있는 토기 가마 보고서”, “대청댐 주변 유적발굴” 등 찾고 싶은 발굴보고서를 작성해보세요."
              autoComplete="off"
            />
            <motion.button className="search-button h-fit" type="submit" aria-label="검색" {...tapScale}>
              <i className="main-search-blue-icon"><span className="blind">검색 버튼</span></i>
            </motion.button>
          </div>
          <AnimatePresence>
            {helperOpen && (
              <motion.div
                key="helper-popup"
                id="helper-popup"
                className="map-search-dropdown align-start z-index-10"
                role="dialog"
                aria-label="검색 도우미 단서 추가"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={springSnappy}
              >
                <div ref={helperPopupRef}>
                  <HelperMenu clues={clues} onToggleClue={toggleClue} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <AnimatePresence>
          {clues.length > 0 && (
            <motion.div
              key="clue-chips"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={fadeEase}
            >
              <ClueChips clues={clues} checkedClues={checkedClues} onToggleChecked={toggleClueChecked} onRemove={toggleClue} />
            </motion.div>
          )}
        </AnimatePresence>

        {isEmptyResult ? (
          <EmptyState query={query} onSuggestion={(text) => { setQuery(text); setMode("history"); }} />
        ) : (
          <>
            {query.trim() === "" && searchHistory.length > 0 && (
              <RecentReports reports={searchHistory} onChoose={chooseRecent} />
            )}
            {query.trim() === "" && searchHistory.length >= 5 && recommendedReports.length > 0 && (
              <RecommendSlider reports={recommendedReports} selectedReports={selectedReports} onToggle={toggleReport} keyword={query} />
            )}
            {(mode === "filtered" || mode === "grouped") && <FilterRail activeFilters={activeFilters} onToggle={toggleFilter} />}

            <ResultHeader label={mode === "grouped" || mode === "filtered" ? activeFilters[0] || "부산" : "총"} count={resultCount} showChat={mode === "grouped" || mode === "filtered"} />
            <ReportGrid reports={shownReports} selectedReports={selectedReports} onToggle={toggleReport} keyword={query} />
          </>
        )}
      </section>

      <AnimatePresence>
        {selectedReports.length > 0 && (
          <motion.div
            key="chat-bar"
            className="fixed bottom-0 left-0 w-full flex justify-center z-index-6"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={springSoft}
            style={{
              padding: "6.4rem 2.4rem 2.4rem",
              background: "linear-gradient(to top, var(--slate-50) 9.6rem, transparent)",
            }}
          >
            <motion.button
              className="blue-button-48 w-300"
              type="button"
              style={{ backgroundImage: "none" }}
              whileTap={{ scale: 0.97 }}
              transition={springSnappy}
            >
              채팅하기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}


