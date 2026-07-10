import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";

import { tapScale } from "../../report-search/motionConfig";

const PREVIEW_DEFAULT_SIZE = 80;
const PREVIEW_MIN_SIZE = 48;
const PREVIEW_MAX_SIZE = 160;
const CORNERS = ["nw", "ne", "sw", "se"] as const;

type Corner = (typeof CORNERS)[number];

type PreviewDrag =
  | {
      mode: "resize";
      corner: Corner;
      startClientX: number;
      startClientY: number;
      startSize: number;
    }
  | {
      mode: "rotate";
      centerX: number;
      centerY: number;
      startAngle: number;
      startRotation: number;
    };

type ChatAttachPreviewProps = {
  url: string;
  name: string;
  onRemove: () => void;
};

function getPointerAngle(clientX: number, clientY: number, centerX: number, centerY: number) {
  return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
}

function getResizeDelta(corner: Corner, deltaX: number, deltaY: number) {
  switch (corner) {
    case "se":
      return Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    case "nw":
      return Math.abs(deltaY) > Math.abs(deltaX) ? -deltaY : -deltaX;
    case "ne":
      return Math.abs(deltaY) > Math.abs(deltaX) ? -deltaY : deltaX;
    case "sw":
      return Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : -deltaX;
  }
}

export function ChatAttachPreview({ url, name, onRemove }: ChatAttachPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<PreviewDrag | null>(null);
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState(PREVIEW_DEFAULT_SIZE);

  const startResize = (corner: Corner) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode: "resize",
      corner,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startSize: size,
    };
  };

  const startRotate = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    dragRef.current = {
      mode: "rotate",
      centerX,
      centerY,
      startAngle: getPointerAngle(event.clientX, event.clientY, centerX, centerY),
      startRotation: rotation,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    event.preventDefault();
    event.stopPropagation();

    if (drag.mode === "rotate") {
      const nextAngle = getPointerAngle(event.clientX, event.clientY, drag.centerX, drag.centerY);
      setRotation(Math.round(drag.startRotation + nextAngle - drag.startAngle));
      return;
    }

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;
    const delta = getResizeDelta(drag.corner, deltaX, deltaY);
    setSize(Math.min(PREVIEW_MAX_SIZE, Math.max(PREVIEW_MIN_SIZE, drag.startSize + delta)));
  };

  const endPointer = (event: PointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = null;
  };

  return (
    <div
      ref={previewRef}
      className="chat-attach-preview"
      style={{
        width: `${size / 10}rem`,
        height: `${size / 10}rem`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img className="chat-attach-preview__image" src={url} alt={name} draggable={false} />
      {CORNERS.map((corner) => (
        <button
          key={`resize-${corner}`}
          className={`chat-attach-preview__resize chat-attach-preview__resize--${corner}`}
          type="button"
          aria-label="첨부 이미지 크기 조정"
          onPointerDown={startResize(corner)}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        />
      ))}
      {CORNERS.map((corner) => (
        <button
          key={`rotate-${corner}`}
          className={`chat-attach-preview__rotate chat-attach-preview__rotate--${corner}`}
          type="button"
          aria-label="첨부 이미지 회전"
          onPointerDown={startRotate}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        />
      ))}
      <motion.button
        className="chat-attach-preview__remove"
        type="button"
        aria-label="첨부 이미지 제거"
        onClick={onRemove}
        onPointerDown={(event) => event.stopPropagation()}
        {...tapScale}
      >
        <i className="chips-close-icon" aria-hidden="true"></i>
      </motion.button>
    </div>
  );
}
