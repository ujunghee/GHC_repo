import { motion } from "framer-motion";
import type { PointerEvent, RefObject } from "react";

import { springSoft, tapScale } from "../../report-search/motionConfig";
import type { Report } from "../../report-search/types";
import { ResizeHandle } from "./ResizeHandle";

type ReportChatSidePanelProps = {
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
  onResizeStart,
  onResizeEnter,
  onResizeLeave,
}: ReportChatSidePanelProps) {
  return (
    <motion.aside
      key="report-panel"
      className="prototype-chat-side-panel relative bg-slate-50 border-r border-slate-200 h-screen flex flex-col overflow-hidden"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springSoft}
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
            <span className="body2-m-16 color-slate-900">전체 선택</span>
            <input
              ref={selectAllRef}
              className="checkbox-basic checkbox-basic-lg"
              type="checkbox"
              checked={isAllChecked}
              onChange={onToggleAll}
              aria-label="전체 선택"
            />
          </div>
        </div>

        <ul className="flex flex-col gap-8">
          {reports.map((report) => {
            const isChecked = activeReportIds.includes(report.id);
            return (
              <li key={report.id}>
                <label
                  className={`bg-white border ${isChecked ? "border-blue-500" : "border-slate-300"} radius-md-8 px-16 flex align-center justify-between cursor-pointer py-10`}
                >
                  <span className="body2-m-16 color-slate-900 text-nowrap" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {report.title}
                  </span>
                  <input
                    className="checkbox-basic checkbox-basic-lg"
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleReport(report.id)}
                    aria-label={`${report.title} 선택`}
                  />
                </label>
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
