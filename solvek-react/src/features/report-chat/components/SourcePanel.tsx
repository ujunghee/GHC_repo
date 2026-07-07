import { motion } from "framer-motion";

import { sourceDocument } from "../data";
import { springSoft } from "../../report-search/motionConfig";
import { ResizeHandle } from "./ResizeHandle";

type SourcePanelProps = {
  width: number;
  title: string;
  isResizing: boolean;
  isResizeHover: boolean;
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeEnter: () => void;
  onResizeLeave: () => void;
};

const toneClass = {
  blue: "bg-blue-50 color-blue-500",
  green: "bg-green-50 color-green-500",
  yellow: "bg-yellow-50 color-yellow-700",
  orange: "bg-orange-50 color-orange-500",
};

export function SourcePanel({ width, title, isResizing, isResizeHover, onResizeStart, onResizeEnter, onResizeLeave }: SourcePanelProps) {
  return (
    <motion.aside
      key="source-panel"
      className="relative bg-white border-l border-slate-200 h-screen overflow-hidden"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springSoft}
      style={{ flexShrink: 0 }}
      aria-label="원문 보기"
    >
      <ResizeHandle
        side="left"
        label="원문 패널 너비 조절"
        active={isResizing}
        hovered={isResizeHover}
        onPointerDown={onResizeStart}
        onMouseEnter={onResizeEnter}
        onMouseLeave={onResizeLeave}
      />

      <div className="h-full px-24 py-24 flex flex-col">
        <div className="flex align-center gap-8 mb-12 flex-none">
          <span className="body3-r-14 color-slate-500">유사도</span>
          {sourceDocument.similarity.map((item) => (
            <span key={item.label} className={`chip radius-full px-10 h-28 flex align-center justify-center body3-r-14 ${toneClass[item.tone]}`}>
              {item.label}
            </span>
          ))}
        </div>

        <h2 className="heading10-sb-20 color-slate-900 flex-none">{sourceDocument.pageLabel} | {title || sourceDocument.title}</h2>

        <article
          className="border border-slate-300 radius-md-8 bg-slate-50 flex-1 overflow-hidden flex align-center justify-center mt-24"
          style={{ minHeight: "0", maxHeight: "100%" }}
        >
          {sourceDocument.pageImageUrl ? (
            <img
              src={sourceDocument.pageImageUrl}
              alt={`${title || sourceDocument.title} ${sourceDocument.pageLabel} 원문 이미지`}
              className="w-full h-full"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <div className="w-full h-full flex align-center justify-center bg-white">
              <span className="body2-r-16 color-slate-400">DB 원문 이미지 영역</span>
            </div>
          )}
        </article>
      </div>
    </motion.aside>
  );
}
