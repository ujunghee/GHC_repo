import { motion } from "framer-motion";
import type { PointerEvent } from "react";

import { sourceDocument } from "../data";
import { springSoft } from "../../report-search/motionConfig";
import { ResizeHandle } from "./ResizeHandle";

type SourcePanelProps = {
  title: string;
  embedded?: boolean;
  width?: number;
  isResizing?: boolean;
  isResizeHover?: boolean;
  onResizeStart?: (event: PointerEvent<HTMLDivElement>) => void;
  onResizeEnter?: () => void;
  onResizeLeave?: () => void;
};

export function SourcePanel({
  title,
  embedded = false,
  width = 0,
  isResizing = false,
  isResizeHover = false,
  onResizeStart,
  onResizeEnter,
  onResizeLeave,
}: SourcePanelProps) {
  const similarityToneClass = getSimilarityToneClass(sourceDocument.similarityScore);

  const content = (
    <div className="h-full px-24 py-24 flex flex-col">
      <div className="flex align-center gap-8 mb-8 flex-none">
        <span className="body3-r-14 color-slate-500">유사도</span>
        <span
          className={`radius-full px-10 h-28 flex align-center justify-center body3-r-14 ${similarityToneClass}`}
          aria-label={`AI 검색 유사도 ${sourceDocument.similarityScore}%`}
        >
          {sourceDocument.similarityScore}%
        </span>
        <span className="radius-full px-10 h-28 flex align-center justify-center body3-r-14 bg-green-50 color-green-500">50%</span>
        <span className="radius-full px-10 h-28 flex align-center justify-center body3-r-14 bg-yellow-50 color-yellow-700">30%</span>
        <span className="radius-full px-10 h-28 flex align-center justify-center body3-r-14 bg-orange-50 color-orange-500">10%</span>
      </div>

      <h2 className="body2-sb-16 color-slate-900 flex align-center gap-4">
        {sourceDocument.pageLabel}
        <span className="color-slate-200" style={{ fontSize: 14, margin: "0 0.4rem" }}>|</span>
        {title || sourceDocument.title}
      </h2>

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
  );

  if (embedded) return content;

  return (
    <motion.aside
      key="source-panel"
      className="relative bg-white border-l border-slate-200 h-screen overflow-hidden"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={isResizing ? { duration: 0 } : springSoft}
      style={{ flexShrink: 0 }}
      aria-label="원문 보기"
    >
      <ResizeHandle
        side="left"
        label="원문 패널 너비 조절"
        active={isResizing}
        hovered={isResizeHover}
        onPointerDown={onResizeStart!}
        onMouseEnter={onResizeEnter!}
        onMouseLeave={onResizeLeave!}
      />
      {content}
    </motion.aside>
  );
}

function getSimilarityToneClass(score: number) {
  if (score >= 75) return "bg-blue-50 color-blue-500";
  if (score >= 50) return "bg-green-50 color-green-500";
  if (score >= 30) return "bg-yellow-50 color-yellow-700";
  return "bg-orange-50 color-orange-500";
}
