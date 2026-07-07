import { motion } from "framer-motion";

import { springSoft } from "../../report-search/motionConfig";

type ResizeHandleProps = {
  side: "left" | "right";
  label: string;
  active: boolean;
  hovered: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
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
        [side]: "-0.4rem",
        width: "0.8rem",
        cursor: "col-resize",
        touchAction: "none",
      }}
    >
      <motion.span
        className="block h-full"
        animate={{
          width: active || hovered ? "0.4rem" : "0.1rem",
          backgroundColor: active || hovered ? "var(--slate-200)" : "rgba(0, 0, 0, 0)",
        }}
        transition={springSoft}
        style={{ margin: "0 auto" }}
      />
    </div>
  );
}
