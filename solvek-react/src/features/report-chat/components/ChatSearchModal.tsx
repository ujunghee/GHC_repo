import type { RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { ClueChips, EmptyState, HelperMenu } from "../../report-search/components/ReportSearchSections";
import { springSnappy, springSoft, tapScale } from "../../report-search/motionConfig";
import type { Report, ReportGroup } from "../../report-search/types";

type ChatSearchModalProps = {
  searchQuery: string;
  searchHelperOpen: boolean;
  searchClues: string[];
  checkedSearchClues: string[];
  searchedReports: Report[];
  groupedSearchReports: ReportGroup[];
  activeReportIds: number[];
  helperPopupRef: RefObject<HTMLDivElement>;
  resultListRef: RefObject<HTMLUListElement>;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onToggleHelper: () => void;
  onToggleClue: (value: string) => void;
  onToggleClueChecked: (value: string) => void;
  onResetClues: () => void;
  onToggleReport: (reportId: number) => void;
};

export function ChatSearchModal({
  searchQuery,
  searchHelperOpen,
  searchClues,
  checkedSearchClues,
  searchedReports,
  groupedSearchReports,
  activeReportIds,
  helperPopupRef,
  resultListRef,
  onClose,
  onQueryChange,
  onSubmit,
  onToggleHelper,
  onToggleClue,
  onToggleClueChecked,
  onResetClues,
  onToggleReport,
}: ChatSearchModalProps) {
  const hasGroupedResults = groupedSearchReports.length > 0;

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full flex align-center justify-center z-index-100"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      style={{ background: "rgba(15, 23, 42, 0.68)", zIndex: 1300 }}
      onMouseDown={onClose}
    >
      <motion.section
        className="bg-white radius-md-8 px-24 py-24"
        layout
        role="dialog"
        aria-modal="true"
        aria-label="보고서 검색"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={springSnappy}
        style={{ width: "min(85.2rem, calc(100vw - 3.2rem))", maxHeight: "min(64rem, calc(100vh - 3.2rem))", overflow: "hidden" }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form
          className="relative mb-26"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="search-wrapper">
            <label className="blind" htmlFor="chat-report-search">
              보고서 검색어
            </label>
            <div className="search-48 flex align-center gap-8 px-12">
              <motion.button
                className={searchHelperOpen ? "filter-tooltip-trigger active flex align-center justify-center" : "filter-tooltip-trigger flex align-center justify-center"}
                type="button"
                aria-label="검색 도우미"
                aria-haspopup="dialog"
                aria-expanded={searchHelperOpen}
                data-chat-filter-trigger
                onClick={onToggleHelper}
                {...tapScale}
              >
                <i className={searchHelperOpen ? "filter-icon active" : "filter-icon"} aria-hidden="true"></i>
              </motion.button>
              <input
                id="chat-report-search"
                type="search"
                className="main-search__input body2-r-16 flex-1"
                value={searchQuery}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="보고서명, 유적명, 지역, 유물명으로 검색하기"
                autoComplete="off"
                autoFocus
              />
            <motion.button className="search-button h-fit" type="submit" aria-label="검색" {...tapScale}>
              <i className="searchbar-search-icon" aria-hidden="true"></i>
            </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {searchHelperOpen && (
              <motion.div
                key="chat-helper-popup"
                className="map-search-dropdown align-start"
                role="dialog"
                aria-label="검색 도우미 단서 추가"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={springSnappy}
              >
                <div ref={helperPopupRef}>
                  <HelperMenu clues={searchClues} onToggleClue={onToggleClue} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <LayoutGroup>
          <AnimatePresence initial={false}>
            {searchClues.length > 0 && (
              <motion.div
                key="chat-search-clues"
                layout
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{
                  layout: springSoft,
                  height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.26 },
                  y: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                }}
                style={{ overflow: "hidden" }}
              >
                <ClueChips
                clues={searchClues}
                checkedClues={checkedSearchClues}
                onToggleChecked={onToggleClueChecked}
                onRemove={onToggleClue}
                onReset={onResetClues}
                showNavigation={false}
              />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="overflow-hidden mt-24" layout="position" transition={springSoft} style={{ height: "min(46.4rem, calc(100vh - 20rem))" }}>
            <AnimatePresence mode="wait" initial={false}>
              {!hasGroupedResults && searchedReports.length === 0 ? (
                <motion.div
                  key="empty"
                  className="h-full overflow-auto flex align-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <EmptyState query={searchQuery} onSuggestion={onQueryChange} />
                </motion.div>
              ) : hasGroupedResults ? (
                <motion.div
                  key="grouped-results"
                  className="h-full overflow-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flex flex-col gap-24">
                    {groupedSearchReports.map((group) => (
                      <section key={group.label} aria-label={`${group.label} 보고서 그룹`}>
                        <p className="body2-m-16 color-slate-900 mb-8">
                          {group.label} <strong className="color-blue-500">{group.reports.length}</strong> 건
                        </p>
                        <ul className="flex flex-col gap-12">
                          {group.reports.map((report) => (
                            <ChatSearchReportItem
                              key={`${group.label}-${report.id}`}
                              report={report}
                              highlightKeyword={searchQuery || group.label}
                              isChecked={activeReportIds.includes(report.id)}
                              onToggle={() => onToggleReport(report.id)}
                            />
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <ul ref={resultListRef} className="h-full flex flex-col gap-12 overflow-auto">
                    {searchedReports.map((report) => (
                      <ChatSearchReportItem
                        key={report.id}
                        report={report}
                        highlightKeyword={searchQuery}
                        isChecked={activeReportIds.includes(report.id)}
                        onToggle={() => onToggleReport(report.id)}
                      />
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </motion.section>
    </motion.div>
  );
}

function ChatSearchReportItem({
  report,
  highlightKeyword,
  isChecked,
  onToggle,
}: {
  report: Report;
  highlightKeyword: string;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const checkboxId = `chat-search-report-${report.id}`;

  return (
    <motion.li layout transition={springSnappy}>
      <motion.div
        layout
        className="flex align-center gap-16 radius-md-8 px-16 py-10 bg-slate-50 border"
        animate={{ borderColor: isChecked ? "var(--blue-500)" : "transparent" }}
        transition={{ duration: 0.2 }}
      >
        <input
          id={checkboxId}
          className="checkbox-basic checkbox-basic-lg"
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
        />
        <label htmlFor={checkboxId} className="flex flex-col gap-4 flex-1 cursor-pointer">
          <span className="body2-sb-16 color-slate-900">{renderHighlightedTitle(report.title, highlightKeyword)}</span>
          <span className="body3-r-14 color-slate-900">{report.summary}</span>
        </label>
      </motion.div>
    </motion.li>
  );
}

function renderHighlightedTitle(title: string, query: string) {
  const keyword = query.trim();
  if (!keyword) return <>{title}</>;

  const index = title.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return <>{title}</>;

  return (
    <>
      {title.slice(0, index)}
      <strong className="color-blue-500">{title.slice(index, index + keyword.length)}</strong>
      {title.slice(index + keyword.length)}
    </>
  );
}
