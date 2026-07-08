import { FormEvent } from "react";
import { motion } from "framer-motion";

import { answerFacts } from "../data";
import type { ChatMessage } from "../types";
import { springSnappy, tapScale } from "../../report-search/motionConfig";
import type { Report } from "../../report-search/types";

type ChatConversationProps = {
  reportTitle: string;
  selectedCount: number;
  activeReports: Report[];
  messages: ChatMessage[];
  suggestionLabels: string[];
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onSend: (text: string) => void;
  onOpenSource: () => void;
};

export function ChatConversation({
  reportTitle,
  selectedCount,
  activeReports,
  messages,
  suggestionLabels,
  message,
  onMessageChange,
  onSubmit,
  onSend,
  onOpenSource,
}: ChatConversationProps) {
  return (
    <div className="h-full flex flex-col">
      <header className="px-24 py-24">
        <h1 className="heading10-sb-20 color-slate-900">
          {reportTitle}{selectedCount > 1 ? " 외 " : " "}
          <strong className="color-blue-500">{selectedCount}건</strong>
        </h1>
      </header>

      <div className="flex-1 overflow-auto flex justify-center">
        <div className="w-full px-16" style={{ maxWidth: "76.4rem", paddingTop: "3.2rem" }}>
          {selectedCount === 0 ? (
            <div className="text-center" style={{ paddingTop: "12rem" }}>
              <p className="heading10-sb-20 color-slate-900 mb-8">보고서를 선택해주세요</p>
              <p className="body2-r-16 color-slate-500">왼쪽 목록에서 대화할 보고서를 1건 이상 선택해야 합니다.</p>
            </div>
          ) : (
            <>
              <p className="body3-r-14 color-slate-500 mb-8 text-left">
                선택한 보고서는 총 {selectedCount} 건 입니다. 최대 5건까지 대화할 수 있어요.
              </p>
              <p className="body2-m-16 color-slate-900 mb-24 text-left">도움이 필요한가요?</p>

              {messages.length === 0 ? (
                <div className="border border-slate-300 radius-md-8 bg-white overflow-hidden w-fit flex flex-col">
                  {suggestionLabels.map((label, index) => (
                    <motion.button
                      key={label}
                      className={index === 0 ? "justify-start px-16 py-12 border-slate-200" : "justify-start px-16 py-12 border-t border-slate-200"}
                      type="button"
                      onClick={() => onSend(label)}
                      style={{ borderRadius: 0 }}
                      {...tapScale}
                    >
                      <span className="body2-r-16 color-slate-900">{label}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-16">
                  {messages.map((item) => (
                    <motion.div
                      key={item.id}
                      className={item.role === "user" ? "flex justify-end" : "flex justify-start"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={springSnappy}
                    >
                      <div
                        className={item.role === "user" ? "bg-slate-50 radius-md-8 px-16 py-12 w-fit" : "px-16 py-12 w-fit"}
                        style={{ maxWidth: "64rem" }}
                      >
                        <p className="body2-r-16 color-slate-900 line-160">{item.text}</p>
                        {item.role === "assistant" && item.hasEvidence && (
                          <EvidenceSummary activeReports={activeReports} onOpenSource={onOpenSource} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <form className="px-24 pb-24 flex justify-center" onSubmit={onSubmit}>
        <div className="w-full" style={{ maxWidth: "76.4rem" }}>
          <p className="body3-r-14 color-slate-500 mb-8">예: 두 보고서의 조사 위치를 비교해줘&nbsp;&nbsp; | &nbsp;&nbsp;A 보고서의 주요 유물은?</p>
          <div className="search-62 flex align-center px-16 bg-white">
            <input
              className="main-search__input body2-r-16 flex-1"
              type="search"
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              placeholder="보고서명, 유적명, 지역, 유물명으로 검색하기"
              aria-label="채팅 메시지"
            />
            <motion.button className="transparent-button-32 flex align-center justify-center" type="button" aria-label="파일 첨부" {...tapScale}>
              <i className="file-attach-icon" aria-hidden="true"></i>
            </motion.button>
            <motion.button className="transparent-button-32 flex align-center justify-center" type="submit" aria-label="검색" {...tapScale}>
              <i className="searchbar-search-icon" aria-hidden="true"></i>
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}

function EvidenceSummary({ activeReports, onOpenSource }: { activeReports: Report[]; onOpenSource: () => void }) {
  return (
    <div className="mt-20">
      <p className="body2-sb-16 color-slate-900 mb-8">{activeReports[0]?.title ?? "함안 우거리 토기가마"}</p>
      <ul className="flex flex-col gap-8 mb-16">
        {answerFacts.map((fact) => (
          <li key={fact.label} className="body2-r-16 color-slate-900 line-160 flex align-center gap-8 flex-wrap">
            <span className="body2-sb-16 color-slate-900">- {fact.label}:</span>
            <span>{fact.value}</span>
            {fact.actions.includes("source") && (
              <motion.button
                className="evidence-action evidence-action--source radius-full px-10 h-28 flex align-center justify-center"
                type="button"
                onClick={onOpenSource}
                {...tapScale}
              >
                <span className="body3-r-14 color-slate-500">원문 p.12 ~ 16</span>
              </motion.button>
            )}
            {fact.actions.includes("map") && (
              <motion.button
                className="evidence-action evidence-action--map radius-full px-10 h-28 flex align-center justify-center"
                type="button"
                {...tapScale}
              >
                <span className="body3-r-14 color-blue-500">지도</span>
              </motion.button>
            )}
          </li>
        ))}
      </ul>

      <div className="bg-slate-50 radius-md-8 px-16 py-16">
        <p className="body2-sb-16 color-slate-900 mb-8">1. 조사 개요 및 환경</p>
        <p className="body2-r-16 color-slate-700 line-160">
          조사 개요와 자연 및 역사 고고환경을 기준으로 보고서의 핵심 내용을 정리합니다.
        </p>
      </div>
    </div>
  );
}
