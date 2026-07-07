import { useMemo, useState } from "react";

import { ChatPage } from "./features/report-chat/ChatPage";
import { MainSearchPage } from "./features/report-search/MainSearchPage";
import { reportData } from "./features/report-search/data";

type AppView = "search" | "chat";

export function App() {
  const [view, setView] = useState<AppView>("search");
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);

  const selectedReports = useMemo(
    () => reportData.filter((report) => selectedReportIds.includes(report.id)),
    [selectedReportIds],
  );

  const startChat = (reportIds: number[]) => {
    if (reportIds.length === 0) return;
    setSelectedReportIds(reportIds);
    setView("chat");
  };

  if (view === "chat") {
    return <ChatPage reports={selectedReports} onBack={() => setView("search")} />;
  }

  return <MainSearchPage onStartChat={startChat} />;
}
