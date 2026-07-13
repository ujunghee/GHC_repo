import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { answerFacts } from "../data";
import type { ChatMessage, DrawingCandidate } from "../types";
import { springSnappy, springSoft, tapScale } from "../../report-search/motionConfig";
import { ChatAttachPreview } from "./ChatAttachPreview";
import type { Report } from "../../report-search/types";

type AttachedImage = {
  url: string;
  name: string;
};

type ChatConversationProps = {
  reportTitle: string;
  selectedCount: number;
  activeReports: Report[];
  messages: ChatMessage[];
  suggestionLabels: string[];
  message: string;
  onMessageChange: (value: string) => void;
  onSend: (text: string, imageUrl?: string) => void;
  onOpenSource: () => void;
  onOpenMap: (candidate?: DrawingCandidate) => void;
};

const ATTACHED_PLACEHOLDER = "이 이미지가 보고서 어디에 나오는지 찾아줘";
const DEFAULT_PLACEHOLDER = "보고서명, 유적명, 지역, 유물명으로 검색하기";

export function ChatConversation({
  reportTitle,
  selectedCount,
  activeReports,
  messages,
  suggestionLabels,
  message,
  onMessageChange,
  onSend,
  onOpenSource,
  onOpenMap,
}: ChatConversationProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canAttach = selectedCount > 0;

  useEffect(() => {
    return () => {
      if (attachedImage?.url) URL.revokeObjectURL(attachedImage.url);
    };
  }, [attachedImage]);

  const acceptImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setAttachedImage((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return { url: URL.createObjectURL(file), name: file.name };
    });

    if (!message.trim()) {
      onMessageChange(ATTACHED_PLACEHOLDER);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAttach || !event.dataTransfer.types.includes("Files")) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAttach) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;

    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAttach || !event.dataTransfer.types.includes("Files")) return;

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAttach) return;

    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) acceptImageFile(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) acceptImageFile(file);
    event.target.value = "";
  };

  const removeAttachedImage = () => {
    setAttachedImage((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });

    if (message === ATTACHED_PLACEHOLDER) {
      onMessageChange("");
    }
  };

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canAttach) return;

    const text = message.trim();
    const imageUrl = attachedImage?.url;

    if (!text && !imageUrl) return;

    onSend(text || ATTACHED_PLACEHOLDER, imageUrl);
    setAttachedImage(null);
    onMessageChange("");
  };

  return (
    <div
      className="h-full flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && canAttach && (
          <motion.div
            key="chat-drop-overlay"
            className="chat-drop-overlay flex flex-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            aria-hidden="true"
          >
            <span className="chat-drop-overlay__message body2-m-16">드롭하여 첨부 해주세요.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-24 py-24">
        <h1 className="body2-sb-16 color-slate-900">
          {reportTitle}{selectedCount > 1 ? " 외 " : " "}
          <strong className="color-blue-500">{selectedCount}건</strong>
        </h1>
      </header>

      <div className="flex-1 overflow-auto flex justify-center">
        <div className="w-full px-16" style={{ maxWidth: "76.4rem", paddingTop: "3.2rem" }}>
          {selectedCount === 0 ? (
            <div className="text-center" style={{ paddingTop: "12rem" }}>
              <p className="body2-sb-16 color-slate-900 mb-8">보고서를 선택해주세요</p>
              <p className="body2-r-16 color-slate-500">왼쪽 목록에서 대화할 보고서를 1건 이상 선택해야 합니다.</p>
            </div>
          ) : (
            <>
              <p className="body3-r-14 color-slate-500 mb-8 text-left">
                선택한 보고서는 총 {selectedCount} 건 입니다.
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
                        className={
                          item.role === "user"
                            ? "bg-slate-50 radius-md-8 px-16 py-12 w-fit flex flex-col gap-8"
                            : "px-16 py-12 w-fit"
                        }
                        style={{ maxWidth: "64rem" }}
                      >
                        {item.text && <p className="body2-r-16 color-slate-900 line-160">{item.text}</p>}
                        {item.role === "user" && item.imageUrl && (
                          <div className="chat-message-image">
                            <img src={item.imageUrl} alt="첨부 이미지" />
                          </div>
                        )}
                        {item.role === "assistant" && item.hasEvidence && (
                          <EvidenceSummary activeReports={activeReports} onOpenSource={onOpenSource} onOpenMap={onOpenMap} />
                        )}
                        {item.role === "assistant" && item.drawingCandidates && (
                          <DrawingCandidateSummary
                            candidates={item.drawingCandidates}
                            onOpenSource={onOpenSource}
                            onOpenMap={onOpenMap}
                          />
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

      <form className="px-24 pb-24 flex justify-center" onSubmit={handleFormSubmit}>
        <div className="w-full" style={{ maxWidth: "76.4rem" }}>
          <label className="blind" htmlFor="chat-file-attach">
            파일 첨부
          </label>
          <input
            id="chat-file-attach"
            ref={fileInputRef}
            className="blind"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
          />

          {attachedImage ? (
            <div className="search-62 search-62--with-attach px-16 bg-white">
              <ChatAttachPreview url={attachedImage.url} name={attachedImage.name} onRemove={removeAttachedImage} />
              <div className="chat-compose__footer">
                <label className="blind" htmlFor="chat-message-input">
                  채팅 메시지
                </label>
                <input
                  id="chat-message-input"
                  className="chat-compose__field main-search__input body2-r-16"
                  type="text"
                  value={message}
                  onChange={(event) => onMessageChange(event.target.value)}
                  placeholder={ATTACHED_PLACEHOLDER}
                />
                <div className="chat-compose__actions">
                  <motion.button
                    className="transparent-button-32 flex align-center justify-center"
                    type="button"
                    aria-label="파일 첨부"
                    disabled={!canAttach}
                    onClick={() => fileInputRef.current?.click()}
                    {...tapScale}
                  >
                    <i className="file-attach-icon" aria-hidden="true"></i>
                  </motion.button>
                  <motion.button className="transparent-button-32 flex align-center justify-center" type="submit" aria-label="검색" {...tapScale}>
                    <i className="searchbar-search-icon" aria-hidden="true"></i>
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div className="search-62 flex align-center px-16 bg-white gap-8">
              <label className="blind" htmlFor="chat-message-input">
                채팅 메시지
              </label>
              <input
                id="chat-message-input"
                className="main-search__input body2-r-16 flex-1"
                type="search"
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                placeholder={DEFAULT_PLACEHOLDER}
              />
              <motion.button
                className="transparent-button-32 flex align-center justify-center"
                type="button"
                aria-label="파일 첨부"
                disabled={!canAttach}
                onClick={() => fileInputRef.current?.click()}
                {...tapScale}
              >
                <i className="file-attach-icon" aria-hidden="true"></i>
              </motion.button>
              <motion.button className="transparent-button-32 flex align-center justify-center" type="submit" aria-label="검색" {...tapScale}>
                <i className="searchbar-search-icon" aria-hidden="true"></i>
              </motion.button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function DrawingCandidateSummary({
  candidates,
  onOpenSource,
  onOpenMap,
}: {
  candidates: NonNullable<ChatMessage["drawingCandidates"]>;
  onOpenSource: () => void;
  onOpenMap: (candidate: DrawingCandidate) => void;
}) {
  const [activeCandidateId, setActiveCandidateId] = useState<number | null>(null);
  const [activeCandidateAction, setActiveCandidateAction] = useState<"map" | "source" | null>(null);

  return (
    <div className="mt-32 w-full" style={{ maxWidth: "56rem" }}>
      <p className="body2-sb-16 color-slate-900 mb-16">
        유사후보 <strong className="color-blue-500">{candidates.length}</strong> 건
      </p>

      <div className="flex flex-col gap-20">
        {candidates.map((candidate) => {
          const isMapActive = activeCandidateId === candidate.id && activeCandidateAction === "map";
          const isSourceActive = activeCandidateId === candidate.id && activeCandidateAction === "source";

          return (
            <div
              className={`border ${activeCandidateId === candidate.id ? "border-blue-500" : "border-slate-300"} radius-md-8 bg-white p-16 flex flex-wrap gap-16`}
              key={candidate.id}
            >
              <div
                className="bg-slate-50 radius-md-8 flex flex-center overflow-hidden flex-none"
                style={{ width: "15rem", height: "15rem" }}
                aria-hidden="true"
              >
                {candidate.thumbnailUrl ? (
                  <img className="w-full h-full" src={candidate.thumbnailUrl} alt="" style={{ objectFit: "cover" }} />
                ) : (
                  <i className="not-file" style={{ width: "3.2rem", height: "3.2rem", margin: 0 }}></i>
                )}
              </div>

              <div className="flex-1" style={{ flexBasis: "28rem", minWidth: 0, paddingTop: "0.2rem" }}>
                <div className="flex align-center gap-8 mb-12">
                  <span className="body3-m-14 color-slate-700">{candidate.pageLabel}</span>
                  <span className="border-l border-slate-300" style={{ height: "1.8rem" }} aria-hidden="true"></span>
                  <span className="body3-sb-14 color-slate-900">{candidate.typeLabel}</span>
                  <span className="body4-r-13 color-orange-500">유사도 {candidate.similarity}%</span>
                </div>

                <p className="body3-m-14 color-slate-700 mb-6">{candidate.reportTitle}</p>
                <p className="body2-sb-16 color-slate-900 mb-20">{candidate.title}</p>

                <div className="flex align-center gap-8 flex-wrap">
                  <motion.button
                    className={`${isMapActive ? "blue-button-32" : "slate-50-button-32"} gap-8`}
                    type="button"
                    onClick={() => {
                      setActiveCandidateId(candidate.id);
                      setActiveCandidateAction("map");
                      onOpenMap(candidate);
                    }}
                    {...tapScale}
                  >
                    <i className="map-icon" aria-hidden="true" style={isMapActive ? { filter: "brightness(0) invert(1)" } : undefined}></i>
                    <span>지도에서 보기</span>
                  </motion.button>

                  {candidate.hasSource && (
                    <motion.button
                      className={isSourceActive ? "blue-button-32" : "slate-50-button-32"}
                      type="button"
                      onClick={() => {
                        setActiveCandidateId(candidate.id);
                        setActiveCandidateAction("source");
                        onOpenSource();
                      }}
                      {...tapScale}
                    >
                      <span>원문 보기</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EvidenceSummary({
  activeReports,
  onOpenSource,
  onOpenMap,
}: {
  activeReports: Report[];
  onOpenSource: () => void;
  onOpenMap: () => void;
}) {
  const [toastVisible, setToastVisible] = useState(false);

  const reportTitle = activeReports[0]?.title ?? "함안 우거리 토기가마";
  const summaryTitle = "1. 조사 개요 및 환경";
  const summaryText = "조사 개요와 자연 및 역사 고고환경을 기준으로 보고서의 핵심 내용을 정리합니다.";

  const getCopyText = () => [summaryTitle, summaryText].join("\n\n");

  const handleCopySummary = async () => {
    const text = getCopyText();

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  };

  return (
    <>
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            key="copy-toast"
            className="toast active bg-blue-50 radius-md-8 shadow-lg px-16 py-8 flex align-center gap-6 z-index-10"
            role="status"
            initial={{ opacity: 0, y: -32, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            transition={springSoft}
            style={{ top: "3.2rem", left: "50%", visibility: "visible", transition: "none" }}
          >
            <span className="body2-sb-16 color-blue-500">복사 완료</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-20">
        <p className="body2-sb-16 color-slate-900 mb-8">{reportTitle}</p>
        <ul className="flex flex-col gap-8 mb-16">
          {answerFacts.map((fact) => (
            <li key={fact.label} className="body2-r-16 color-slate-900 line-160 flex align-center gap-8 flex-wrap">
              <span className="body2-m-16 color-slate-700">- {fact.label}:</span>
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
                onClick={onOpenMap}
                {...tapScale}
              >
                  <span className="body3-r-14 color-blue-500">지도</span>
                </motion.button>
              )}
            </li>
          ))}
        </ul>

        <div className="bg-slate-50 radius-md-8 px-16 py-16">
          <div className="flex align-start justify-between gap-8">
            <div className="flex-1">
              <p className="body2-sb-16 color-slate-900 mb-8">{summaryTitle}</p>
              <p className="body2-r-16 color-slate-700 line-160">{summaryText}</p>
            </div>
            <motion.button
              className="flex align-center justify-center flex-none p-0"
              type="button"
              aria-label="핵심 내용 복사"
              onClick={handleCopySummary}
              {...tapScale}
            >
              <i className="copy-icon" aria-hidden="true"></i>
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
