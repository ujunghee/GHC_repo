import { reportData } from "./data";

export type ViewMode = "default" | "history" | "filtered" | "grouped" | "empty" | "recommend";
export type Report = (typeof reportData)[number];
export type HelperCategory = { key: string; label: string; options: string[] };
