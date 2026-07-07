import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import { filterChips, helperCategories, suggestions } from "../data";
import { fadeEase, springSnappy, tapScale } from "../motionConfig";
import type { Report } from "../types";
const checkIcon =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='12' viewBox='0 0 14 12' fill='none'%3E%3Cpath d='M1 6.5L5 10.5L13 1.5' stroke='%231A76FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center / contain no-repeat";

export function HelperMenu({ clues, onToggleClue }: { clues: string[]; onToggleClue: (value: string) => void }) {
  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxRef = useRef<HTMLUListElement>(null);

  const activeCategory = categoryKey ? helperCategories.find((item) => item.key === categoryKey) ?? null : null;

  useEffect(() => {
    if (!activeCategory) return;
    setActiveIndex(0);
    listboxRef.current?.focus();
    // 카테고리 전환 시에만 포커스/활성 인덱스를 초기화한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey]);

  const chooseOption = (option: string) => {
    if (!categoryKey) return;
    onToggleClue(option);
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (!activeCategory) return;
    const lastIndex = activeCategory.options.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, lastIndex));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        chooseOption(activeCategory.options[activeIndex]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-row gap-6">
        <section
          className="bg-white radius-md-8 shadow-lg border border-slate-300 p-16 w-200 flex flex-col"
          aria-labelledby="helper-title"
          style={{ height: "18.8rem"}}
        >
          <h2 id="helper-title" className="body3-r-14 color-slate-900 mb-16">어떤 단서를 추가할까요?</h2>
          {helperCategories.map((item) => {
            const isActive = item.key === categoryKey;
            const selectedCount = item.options.filter((option) => clues.includes(option)).length;
            return (
              <motion.button
                key={item.key}
                className={
                  isActive
                    ? "transparent-button-40 flex align-center justify-between w-full bg-slate-50 flex-auto"
                    : "transparent-button-40 flex align-center justify-between w-full hover-slate-50 flex-auto"
                }
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isActive}
                aria-controls={isActive ? "helper-detail-listbox" : undefined}
                onClick={() => setCategoryKey(item.key)}
                style={{ width: "100%", height: "3.6rem", flexShrink: 0, padding: "0" }}
                whileTap={{ scale: 0.98 }}
                transition={springSnappy}
              >
                <span className="body2-r-16 color-slate-900 flex-1 text-left pl-8">
                  {item.label}
                  {selectedCount > 0 && (
                    <>
                      {" "}
                      <strong className="color-blue-500">{selectedCount}</strong>
                    </>
                  )}
                </span>
                <i className="chevron-right-slate-700" aria-hidden="true"></i>
              </motion.button>
            );
          })}
        </section>

        <AnimatePresence mode="wait">
          {activeCategory && (
            <motion.section
              key={activeCategory.key}
              className="bg-white radius-md-8 shadow-lg border border-slate-300 p-16 w-200"
              aria-label={`${activeCategory.label} 상세`}
              style={{ height: "18.8rem", display: "flex", flexDirection: "column", overflowY: "auto" }}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={fadeEase}
            >
              <ul
                id="helper-detail-listbox"
                ref={listboxRef}
                className="w-full flex-auto flex flex-col gap-4"
                role="listbox"
                aria-label={`${activeCategory.label} 옵션`}
                aria-multiselectable="true"
                tabIndex={0}
                aria-activedescendant={`helper-option-${activeIndex}`}
                onKeyDown={handleListboxKeyDown}
              >
                {activeCategory.options.map((option, index) => {
                  const selected = clues.includes(option);
                  const focused = index === activeIndex;
                  return (
                    <motion.li
                      key={`${option}-${index}`}
                      id={`helper-option-${index}`}
                      role="option"
                      aria-selected={selected}
                      onClick={() => chooseOption(option)}
                      onMouseEnter={() => setActiveIndex(index)}
                      whileTap={{ scale: 0.98 }}
                      animate={{ background: selected || focused ? "var(--slate-50)" : "transparent" }}
                      transition={{ duration: 0.15 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        height: "3.6rem",
                        padding: "0 var(--spacing-12)",
                        borderRadius: "var(--radius-md-6)",
                        cursor: "pointer",
                      }}
                    >
                      <span className={selected ? "body2-r-16 color-blue-500" : "body2-r-16 color-slate-900"}>{option}</span>
                      {selected && (
                        <motion.i
                          aria-hidden="true"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={springSnappy}
                          style={{ flex: "none", width: "1.4rem", height: "1.2rem", background: checkIcon }}
                        />
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>
    </div>
  );
}

export function FilterRail({ activeFilters, onToggle }: { activeFilters: string[]; onToggle: (filter: string) => void }) {
  return (
    <div className="flex flex-row gap-8 mt-16 overflow-hidden" aria-label="검색 필터">
      {filterChips.map((filter, index) => (
        <label className="checkbox-chip-label body2-r-16" key={`${filter}-${index}`}>
          <input className="checkbox-chip" type="checkbox" checked={activeFilters.includes(filter)} onChange={() => onToggle(filter)} />
          <span className="body2-m-16">{filter}</span>
        </label>
      ))}
      <motion.button className="border-slate-button-40 radius-full flex align-center justify-center" type="button" aria-label="필터 더보기" {...tapScale}>
        <i className="chevron-right-slate-700" aria-hidden="true"></i>
      </motion.button>
    </div>
  );
}

export function RecentReports({ reports, onChoose }: { reports: string[]; onChoose: (report: string) => void }) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const syncEdges = (instance: SwiperClass) => {
    setIsBeginning(instance.isBeginning);
    setIsEnd(instance.isEnd);
  };

  return (
    <section className="mt-24" aria-label="최근 검색한 보고서">
      <h2 className="body1-sb-18 color-slate-900 mb-16">최근 검색한 보고서</h2>
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={8}
          grabCursor
          onSwiper={(instance) => {
            setSwiper(instance);
            syncEdges(instance);
          }}
          onSlideChange={syncEdges}
          onResize={syncEdges}
          onReachBeginning={() => setIsBeginning(true)}
          onReachEnd={() => setIsEnd(true)}
        >
          {reports.map((report) => (
            <SwiperSlide key={report} style={{ width: "auto" }}>
              <motion.button
                className="chip border-slate-500 border h-36 w-fit px-12 radius-full flex align-center justify-center bg-white"
                type="button"
                onClick={() => onChoose(report)}
                style={{ whiteSpace: "nowrap" }}
                {...tapScale}
              >
                <span className="body2-r-16 color-slate-700">{report} ↗</span>
              </motion.button>
            </SwiperSlide>
          ))}
        </Swiper>

        {!isBeginning && (
          <motion.button
            type="button"
            className="bg-white radius-full flex align-center justify-center shadow-lg"
            aria-label="이전 최근 검색"
            onClick={() => swiper?.slidePrev()}
            style={{ ...sliderNavButtonStyle, left: "-2rem" }}
            {...tapScale}
          >
            <i className="chevron-left-slate-700" aria-hidden="true"></i>
          </motion.button>
        )}
        {!isEnd && (
          <motion.button
            type="button"
            className="bg-white radius-full flex align-center justify-center shadow-lg"
            aria-label="다음 최근 검색"
            onClick={() => swiper?.slideNext()}
            style={{ ...sliderNavButtonStyle, right: "-2rem" }}
            {...tapScale}
          >
            <i className="chevron-right-slate-700" aria-hidden="true"></i>
          </motion.button>
        )}
      </div>
    </section>
  );
}

export function ResultHeader({ label, count, showChat = false }: { label: string; count: number; showChat?: boolean }) {
  return (
    <div className="flex justify-between align-center mt-40 mb-16">
      <p className="body1-sb-18 color-slate-900">{label} <strong className="color-blue-500">{count}</strong> 건</p>
      {showChat && (
        <motion.button className="transparent-button-40 flex align-center gap-8" type="button" {...tapScale}>
          <span className="body2-sb-16 color-slate-900">채팅하기</span>
          <i className="chevron-right-slate-700" aria-hidden="true"></i>
        </motion.button>
      )}
    </div>
  );
}

function highlightMatch(text: string, keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed) return text;
  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="color-blue-500 bg-white">{text.slice(index, index + trimmed.length)}</mark>
      {text.slice(index + trimmed.length)}
    </>
  );
}

function ReportCard({ report, selected, onToggle, keyword }: { report: Report; selected: boolean; onToggle: (id: number) => void; keyword: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onToggle(report.id);
  };

  return (
    <motion.a
      href="#"
      className={selected ? "border border-blue-500 radius-md-8 p-16 flex flex-col bg-white gap-16 h-full" : "border border-slate-200 radius-md-8 p-16 flex flex-col bg-white gap-16 h-full"}
      aria-pressed={selected}
      onClick={handleClick}
      itemScope
      itemType="https://schema.org/Dataset"
      layout
      whileTap={{ scale: 0.985 }}
      animate={{
        borderColor: selected ? "var(--blue-500)" : "var(--slate-200)",
        boxShadow: selected ? "0 0 0 1px var(--blue-500)" : "0 0 0 0px transparent",
      }}
      transition={springSnappy}
    >
      <div className="flex flex-col gap-8">
        <div className="flex justify-between align-center gap-16">
          <h3 className="body1-sb-18 color-slate-900 line-160" itemProp="name">{highlightMatch(report.title, keyword)}</h3>
          <span className="body2-r-16 color-slate-500">{report.year}</span>
        </div>
        <p className="body3-r-14 color-slate-900 line-160">{highlightMatch(report.summary, keyword)}</p>
      </div>
      <ul className="meta-tag-list">
        {report.tags.map((tag) => {
          const active = keyword.trim() !== "" && tag.toLowerCase().includes(keyword.trim().toLowerCase());
          return (
            <li key={tag}><span className={active ? "meta-tag meta-tag--active" : "meta-tag"}>{tag}</span></li>
          );
        })}
      </ul>
    </motion.a>
  );
}

export function ReportGrid({ reports, selectedReports, onToggle, keyword }: { reports: Report[]; selectedReports: number[]; onToggle: (id: number) => void; keyword: string }) {
  return (
    <ul className="grid-column-sub-8 gap-y-20">
      {reports.map((report) => (
        <motion.li
          className="grid-column-4"
          key={report.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fadeEase}
        >
          <ReportCard report={report} selected={selectedReports.includes(report.id)} onToggle={onToggle} keyword={keyword} />
        </motion.li>
      ))}
    </ul>
  );
}

const sliderNavButtonStyle = {
  position: "absolute" as const,
  top: "50%",
  transform: "translateY(-50%)",
  width: "4rem",
  height: "4rem",
  border: "1px solid var(--slate-200)",
  cursor: "pointer",
  zIndex: 2,
};

export function RecommendSlider({ reports, selectedReports, onToggle, keyword }: { reports: Report[]; selectedReports: number[]; onToggle: (id: number) => void; keyword: string }) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const syncEdges = (instance: SwiperClass) => {
    setIsBeginning(instance.isBeginning);
    setIsEnd(instance.isEnd);
  };

  return (
    <section className="mt-40" aria-label="추천 보고서">
      <h2 className="body1-sb-18 color-slate-900 mb-16">추천 보고서</h2>
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor
          onSwiper={(instance) => {
            setSwiper(instance);
            syncEdges(instance);
          }}
          onSlideChange={syncEdges}
          onResize={syncEdges}
          onReachBeginning={() => setIsBeginning(true)}
          onReachEnd={() => setIsEnd(true)}
        >
          {reports.map((report) => (
            <SwiperSlide key={report.id} style={{ width: "30rem", height: "auto" }}>
              <ReportCard report={report} selected={selectedReports.includes(report.id)} onToggle={onToggle} keyword={keyword} />
            </SwiperSlide>
          ))}
        </Swiper>

        {!isBeginning && (
          <motion.button
            type="button"
            className="bg-white radius-full flex align-center justify-center shadow-lg"
            aria-label="이전 추천 보고서"
            onClick={() => swiper?.slidePrev()}
            style={{ ...sliderNavButtonStyle, left: "-2rem" }}
            {...tapScale}
          >
            <i className="chevron-left-slate-700" aria-hidden="true"></i>
          </motion.button>
        )}
        {!isEnd && (
          <motion.button
            type="button"
            className="bg-white radius-full flex align-center justify-center shadow-lg"
            aria-label="다음 추천 보고서"
            onClick={() => swiper?.slideNext()}
            style={{ ...sliderNavButtonStyle, right: "-2rem" }}
            {...tapScale}
          >
            <i className="chevron-right-slate-700" aria-hidden="true"></i>
          </motion.button>
        )}
      </div>
    </section>
  );
}

export function ClueChips({ clues, checkedClues, onToggleChecked, onRemove }: { clues: string[]; checkedClues: string[]; onToggleChecked: (value: string) => void; onRemove: (value: string) => void }) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const syncEdges = (instance: SwiperClass) => {
    setIsBeginning(instance.isBeginning);
    setIsEnd(instance.isEnd);
  };

  useEffect(() => {
    if (!swiper) return;
    swiper.update();
    syncEdges(swiper);
  }, [clues, checkedClues, swiper]);

  return (
    <div className="relative mt-16" aria-label="선택한 단서">
      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        spaceBetween={8}
        grabCursor
        onSwiper={(instance) => {
          setSwiper(instance);
          syncEdges(instance);
        }}
        onSlideChange={syncEdges}
        onResize={syncEdges}
        onReachBeginning={() => setIsBeginning(true)}
        onReachEnd={() => setIsEnd(true)}
      >
        {clues.map((clue) => {
          const checked = checkedClues.includes(clue);
          return (
            <SwiperSlide key={clue} style={{ width: "auto" }}>
              <label className="checkbox-chip-label body2-r-16">
                <input
                  className="checkbox-chip"
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleChecked(clue)}
                  aria-label={clue}
                />
                <span className="body2-m-16">{clue}</span>
                {checked && (
                  <button
                    type="button"
                    className="chips-close-icon block"
                    aria-label={`${clue} 삭제`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onRemove(clue);
                    }}
                    style={{ border: "none", padding: 0, marginInlineStart: "0.8rem", cursor: "pointer" }}
                  ></button>
                )}
              </label>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {!isBeginning && (
        <motion.button
          type="button"
          className="bg-white radius-full flex align-center justify-center shadow-lg"
          aria-label="이전 단서"
          onClick={() => swiper?.slidePrev()}
          style={{ ...sliderNavButtonStyle, left: "-2rem" }}
          {...tapScale}
        >
          <i className="chevron-left-slate-700" aria-hidden="true"></i>
        </motion.button>
      )}
      {!isEnd && (
        <motion.button
          type="button"
          className="bg-white radius-full flex align-center justify-center shadow-lg"
          aria-label="다음 단서"
          onClick={() => swiper?.slideNext()}
          style={{ ...sliderNavButtonStyle, right: "-2rem" }}
          {...tapScale}
        >
          <i className="chevron-right-slate-700" aria-hidden="true"></i>
        </motion.button>
      )}
    </div>
  );
}

export function EmptyState({ query, onSuggestion }: { query: string; onSuggestion: (text: string) => void }) {
  return (
    <motion.section
      className="flex flex-col align-center text-center mt-40"
      aria-label="검색 결과 없음"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeEase}
    >
      <i className="not-file mb-20" aria-hidden="true"></i>
      <h2 className="heading9-sb-22 color-slate-900 mb-20">“{query || "489651"}” 를 찾을 수 없습니다</h2>
      <p className="body2-r-16 color-slate-500 line-160 mb-24">아래에 항목과 비슷한 보고서를<br />찾고 계시나요?</p>
      <div className="flex flex-row gap-8">
        {suggestions.map((suggestion) => (
          <motion.button
            className="chip border-slate-500 border h-36 w-fit px-12 radius-full flex align-center justify-center bg-white"
            type="button"
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            {...tapScale}
          >
            <span className="body2-r-16 color-slate-700">{suggestion}</span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}

