export const springSnappy = { type: "spring" as const, stiffness: 300, damping: 32 };
export const springSoft = { type: "spring" as const, stiffness: 240, damping: 30 };
export const fadeEase = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };
export const tapScale = {
  whileTap: { scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 320, damping: 28 },
};
