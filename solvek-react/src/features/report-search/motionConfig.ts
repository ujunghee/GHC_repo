export const springSnappy = { type: "spring" as const, stiffness: 420, damping: 30 };
export const springSoft = { type: "spring" as const, stiffness: 320, damping: 28 };
export const fadeEase = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const };
export const tapScale = {
  whileTap: { scale: 0.96 },
  transition: { type: "spring" as const, stiffness: 500, damping: 30 },
};
