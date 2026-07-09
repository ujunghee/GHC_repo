import { reportData } from "./data";
import type { Report, ReportGroup } from "./types";

export function filterReportsByKeyword(reports: Report[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return reports;

  return reports.filter(
    (report) =>
      report.title.toLowerCase().includes(normalizedKeyword) ||
      report.summary.toLowerCase().includes(normalizedKeyword) ||
      report.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword)),
  );
}

export function buildGroupedReports(
  baseReports: Report[],
  keywords: string[],
  limit = 3,
): ReportGroup[] {
  if (keywords.length === 0) return [];

  const reports = baseReports.length > 0 ? baseReports : reportData;

  return keywords.map((keyword) => {
    const matchedReports = filterReportsByKeyword(reports, keyword);

    return {
      label: keyword,
      reports: (matchedReports.length > 0 ? matchedReports : reports).slice(0, limit),
    };
  });
}
