import type { PointerEvent } from "react";

type ResizeHandleProps = {
  side: "left" | "right";
  label: string;
  active: boolean;
  hovered: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function ResizeHandle({ side, label, active, hovered, onPointerDown, onMouseEnter, onMouseLeave }: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      tabIndex={0}
      className="absolute top-0 h-full z-index-3"
      onPointerDown={onPointerDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        [side]: "-0.8rem",
        zIndex: 1200,
        width: "1.6rem",
        cursor: "col-resize",
        touchAction: "none",
      }}
    >
      <span
        className="block h-full"
        style={{
          margin: "0 auto",
          width: active || hovered ? "0.4rem" : "0.1rem",
          backgroundColor: active || hovered ? "var(--slate-200)" : "rgba(0, 0, 0, 0)",
        }}
      />
    </div>
  );
}
