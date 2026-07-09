import { motion } from "framer-motion";
import { useState } from "react";
import type { PointerEvent, RefObject } from "react";

import { springSoft, tapScale } from "../../report-search/motionConfig";
import type { Report } from "../../report-search/types";
import { ResizeHandle } from "./ResizeHandle";

export type ReportChatSidePanelProps = {
  width: number;
  reports: Report[];
  activeReportIds: number[];
  isAllChecked: boolean;
  selectAllRef: RefObject<HTMLInputElement>;
  isResizing: boolean;
  isResizeHover: boolean;
  onBack: () => void;
  onSearch: () => void;
  onToggleAll: () => void;
  onToggleReport: (reportId: number) => void;
  /** 패널 목록에서 보고서 제거 */
  onRemoveReport: (reportId: number) => void;
  onResizeStart: (event: PointerEvent<HTMLDivElement>) => void;
  onResizeEnter: () => void;
  onResizeLeave: () => void;
};

export function ReportChatSidePanel({
  width,
  reports,
  activeReportIds,
  isAllChecked,
  selectAllRef,
  isResizing,
  isResizeHover,
  onBack,
  onSearch,
  onToggleAll,
  onToggleReport,
  onRemoveReport,
  onResizeStart,
  onResizeEnter,
  onResizeLeave,
}: ReportChatSidePanelProps) {
  const [hoveredReportId, setHoveredReportId] = useState<number | null>(null);
  const [menuReportId, setMenuReportId] = useState<number | null>(null);

  return (
    <motion.aside
      key="report-panel"
      className="relative bg-slate-50 border-r border-slate-200 h-screen flex flex-col overflow-hidden"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={isResizing ? { duration: 0 } : springSoft}
      style={{ flexShrink: 0 }}
    >
      <header className="border-b border-slate-200 px-16 py-24 flex align-center justify-between" style={{ height: "8rem" }}>
        <motion.button className="flex align-center gap-8" type="button" onClick={onBack} {...tapScale}>
          <i className="home-icon" aria-hidden="true"></i>
          <span className="body2-m-16 color-slate-900">홈으로</span>
        </motion.button>
        <motion.button className="flex align-center gap-8" type="button" aria-label="보고서 검색" onClick={onSearch} {...tapScale}>
          <i className="search-icon-40" aria-hidden="true"></i>
          <span className="body2-m-16 color-slate-900">검색</span>
        </motion.button>
      </header>

      <section className="flex-1 overflow-auto px-16 py-28" aria-label="선택한 보고서 목록">
        <div className="flex align-center justify-between mb-20">
          <p className="body2-sb-16 color-slate-900">총 <strong className="color-blue-500">{reports.length}</strong> 건</p>
          <div className="flex align-center gap-10">
            <input
              id="report-select-all"
              ref={selectAllRef}
              className="checkbox-basic checkbox-basic-lg"
              type="checkbox"
              checked={isAllChecked}
              onChange={onToggleAll}
            />
            <label htmlFor="report-select-all" className="body2-m-16 color-slate-900 cursor-pointer">
              전체 선택
            </label>
          </div>
        </div>

        <ul className="flex flex-col gap-8">
          {reports.map((report) => {
            const isChecked = activeReportIds.includes(report.id);
            const isMenuOpen = menuReportId === report.id;
            const showAction = hoveredReportId === report.id || isMenuOpen;
            return (
              <li
                key={report.id}
                className="relative"
                onMouseEnter={() => setHoveredReportId(report.id)}
                onMouseLeave={() => {
                  setHoveredReportId(null);
                  setMenuReportId((currentId) => (currentId === report.id ? null : currentId));
                }}
              >
                <div
                  className={`${showAction ? "bg-blue-50" : "bg-white"} border ${isChecked ? "border-blue-500" : "border-slate-300"} radius-md-8 px-16 flex align-center justify-between py-10`}
                >
                  <label
                    htmlFor={`report-select-${report.id}`}
                    className="body2-m-16 color-slate-900 text-nowrap flex-1 cursor-pointer"
                    style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", marginRight: showAction ? "4.4rem" : "1.6rem" }}
                  >
                    {report.title}
                  </label>
                  <input
                    id={`report-select-${report.id}`}
                    className="checkbox-basic checkbox-basic-lg"
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleReport(report.id)}
                  />
                </div>
                <motion.button
                  className="flex align-center justify-center radius-md-8"
                  type="button"
                  aria-label={`${report.title} 메뉴 열기`}
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMenuReportId((currentId) => (currentId === report.id ? null : report.id));
                  }}
                  animate={{ opacity: showAction ? 1 : 0 }}
                  transition={{ duration: 0.16 }}
                  style={{
                    position: "absolute",
                    top: "calc(50% - 1.4rem)",
                    right: "5.2rem",
                    width: "2.8rem",
                    height: "2.8rem",
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    pointerEvents: showAction ? "auto" : "none",
                  }}
                >
                  <i
                    aria-hidden="true"
                    style={{
                      width: "2.4rem",
                      height: "2.4rem",
                      background: "url('./image/icon/details-vertical-stroke.svg') center / contain no-repeat",
                    }}
                  ></i>
                </motion.button>
                {isMenuOpen && (
                  <motion.div
                    className="absolute bg-white border border-slate-200 radius-md-8 shadow-lg z-index-4 p-4"
                    role="menu"
                    aria-label={`${report.title} 작업`}
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    style={{ top: "3.8rem", right: "4.4rem" }}
                  >
                    <motion.button
                      className="transparent-button-32 flex align-center justify-center px-12"
                      type="button"
                      role="menuitem"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onRemoveReport(report.id);
                        setMenuReportId(null);
                      }}
                      disabled={reports.length <= 1}
                      style={{ minWidth: "6.4rem", opacity: reports.length <= 1 ? 0.45 : 1 }}
                      {...tapScale}
                    >
                      <span className="body2-m-16 color-red-500">삭제</span>
                    </motion.button>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <ResizeHandle
        side="right"
        label="보고서 패널 너비 조절"
        active={isResizing}
        hovered={isResizeHover}
        onPointerDown={onResizeStart}
        onMouseEnter={onResizeEnter}
        onMouseLeave={onResizeLeave}
      />
    </motion.aside>
  );
}
