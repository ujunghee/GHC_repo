import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PointerEvent } from "react";

import { mapDocument } from "../data";
import { springSoft, tapScale } from "../../report-search/motionConfig";
import type { MapDocument, MapLayerNode } from "../types";
import { ResizeHandle } from "./ResizeHandle";

type MapPanelProps = {
  embedded?: boolean;
  width?: number;
  isResizing?: boolean;
  isResizeHover?: boolean;
  onResizeStart?: (event: PointerEvent<HTMLDivElement>) => void;
  onResizeEnter?: () => void;
  onResizeLeave?: () => void;
};

type MapTypeId = "general" | "satellite" | "terrain" | "cadastral";
type MapToolId = "radius" | "distance" | "area" | "print";

type CheckedLayerItem = {
  label: string;
  path: number[];
  pathKey: string;
};

const MAX_ACTIVE_LAYERS = 5;

const mapTypes: Array<{ id: MapTypeId; label: string }> = [
  { id: "general", label: "일반" },
  { id: "satellite", label: "위성" },
  { id: "terrain", label: "지형" },
  { id: "cadastral", label: "지적" },
];

const mapTools: Array<{ id: MapToolId; label: string }> = [
  { id: "radius", label: "반경" },
  { id: "distance", label: "거리" },
  { id: "area", label: "면적" },
  { id: "print", label: "인쇄" },
];

export function MapPanel({
  embedded = false,
  width = 0,
  isResizing = false,
  isResizeHover = false,
  onResizeStart,
  onResizeEnter,
  onResizeLeave,
}: MapPanelProps) {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const [mapType, setMapType] = useState<MapTypeId>("general");
  const [activeTool, setActiveTool] = useState<MapToolId | null>(null);
  const [advancedTab, setAdvancedTab] = useState(mapDocument.advancedTabs[0]);
  const [layerRoots, setLayerRoots] = useState(() => {
    const initialRoots = cloneLayerTree(mapDocument.layerRoots);
    const initialOrder = collectCheckedLayers(initialRoots)
      .map((item) => item.pathKey)
      .reverse();

    return trimToMaxActiveLayers(initialRoots, initialOrder).roots;
  });
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [checkedOrder, setCheckedOrder] = useState<string[]>(() => {
    const initialRoots = cloneLayerTree(mapDocument.layerRoots);
    const initialOrder = collectCheckedLayers(initialRoots)
      .map((item) => item.pathKey)
      .reverse();

    return trimToMaxActiveLayers(initialRoots, initialOrder).order;
  });
  const checkedOrderRef = useRef(checkedOrder);
  checkedOrderRef.current = checkedOrder;

  const checkedLayers = useMemo(() => {
    const items = collectCheckedLayers(layerRoots);
    const orderMap = new Map(checkedOrder.map((pathKey, index) => [pathKey, index]));

    return [...items]
      .sort((a, b) => {
        const aOrder = orderMap.get(a.pathKey) ?? Number.MAX_SAFE_INTEGER;
        const bOrder = orderMap.get(b.pathKey) ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      })
      .slice(0, MAX_ACTIVE_LAYERS);
  }, [layerRoots, checkedOrder]);

  const toggleNode = (pathKey: string) => {
    setOpenNodes((current) => ({ ...current, [pathKey]: !current[pathKey] }));
  };

  const toggleLayerChecked = (path: number[]) => {
    const pathKey = path.join("-");
    const order = checkedOrderRef.current;

    setLayerRoots((current) => {
      const currentNode = getNodeAtPath(current, path);
      const willCheck = !(currentNode?.checked ?? false);

      if (!willCheck) {
        const nextOrder = order.filter((key) => key !== pathKey);
        setCheckedOrder(nextOrder);
        checkedOrderRef.current = nextOrder;
        return toggleNodeChecked(current, path);
      }

      let next = current;
      const activeItems = collectCheckedLayers(current);
      let nextOrder = order.filter((key) => key !== pathKey);

      if (activeItems.length >= MAX_ACTIVE_LAYERS) {
        const oldestKey = nextOrder[nextOrder.length - 1];
        const oldestItem = activeItems.find((item) => item.pathKey === oldestKey);

        if (oldestItem) {
          next = toggleNodeChecked(current, oldestItem.path);
          nextOrder = nextOrder.filter((key) => key !== oldestKey);
        }
      }

      nextOrder = [pathKey, ...nextOrder];
      setCheckedOrder(nextOrder);
      checkedOrderRef.current = nextOrder;
      return toggleNodeChecked(next, path);
    });
  };

  const panelContent = (
    <div className="map-panel h-full">
      {isSettingsExpanded && (
        <MapSettingsPanel
          document={mapDocument}
          checkedLayers={checkedLayers}
          layerRoots={layerRoots}
          advancedTab={advancedTab}
          openNodes={openNodes}
          onAdvancedTabChange={setAdvancedTab}
          onToggleNode={toggleNode}
          onToggleLayerChecked={toggleLayerChecked}
          onCollapse={() => setIsSettingsExpanded(false)}
        />
      )}

      <div className="map-panel__viewport">
        <div className="map-panel__canvas" aria-hidden="true">
          <span className="map-panel__marker-area" />
          <span className="map-panel__marker-pin" />
        </div>

        {!isSettingsExpanded && (
          <MapSettingsPopup
            document={mapDocument}
            checkedLayers={checkedLayers}
            onExpand={() => setIsSettingsExpanded(true)}
          />
        )}

        <div className="map-panel__map-type absolute z-index-2" style={{ left: "2rem", bottom: "2rem" }}>
          <div className="radio-toggle-group" role="radiogroup" aria-label="지도 유형">
            {mapTypes.map((item) => (
              <label key={item.id} className="radio-toggle-label">
                <input
                  className="radio-toggle"
                  type="radio"
                  name="map-type"
                  value={item.id}
                  checked={mapType === item.id}
                  onChange={() => setMapType(item.id)}
                />
                <span className="body3-r-14">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="map-panel__controls">
          <div className="map-control" aria-label="지도 도구">
            <div className="map-control__group">
              <motion.button className="map-control__btn" type="button" aria-label="확대" {...tapScale}>
                <i className="plus-icon" aria-hidden="true"></i>
              </motion.button>
              <motion.button className="map-control__btn" type="button" aria-label="축소" {...tapScale}>
                <i className="minus-icon" aria-hidden="true"></i>
              </motion.button>
            </div>
            <div className="map-control__group">
              {mapTools.map((tool) => (
                <motion.button
                  key={tool.id}
                  className={`map-control__btn body3-m-14 ${activeTool === tool.id ? "active" : ""}`}
                  type="button"
                  aria-pressed={activeTool === tool.id}
                  onClick={() => setActiveTool((current) => (current === tool.id ? null : tool.id))}
                  {...tapScale}
                >
                  {tool.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return panelContent;

  return (
    <motion.aside
      key="map-panel"
      className="relative bg-white border-l border-slate-200 h-screen overflow-hidden"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={isResizing ? { duration: 0 } : springSoft}
      style={{ flexShrink: 0 }}
      aria-label="지도 보기"
    >
      <ResizeHandle
        side="left"
        label="지도 패널 너비 조절"
        active={isResizing}
        hovered={isResizeHover}
        onPointerDown={onResizeStart!}
        onMouseEnter={onResizeEnter!}
        onMouseLeave={onResizeLeave!}
      />
      {panelContent}
    </motion.aside>
  );
}

function MapSettingsPopup({
  document,
  checkedLayers,
  onExpand,
}: {
  document: MapDocument;
  checkedLayers: CheckedLayerItem[];
  onExpand: () => void;
}) {
  return (
    <section className="map-settings-popup" aria-label="지도 설정">
      <div className="map-settings-popup__head">
        <h2 className="body2-sb-16 color-slate-900">지도 설정</h2>
        <motion.button
          className="map-panel__icon-btn"
          type="button"
          aria-label="지도 설정 전체보기"
          onClick={onExpand}
          {...tapScale}
        >
          <i className="expand-corner-icon" aria-hidden="true"></i>
        </motion.button>
      </div>
      <div className="map-settings-popup__body">
        <p className="map-settings-popup__location body1-sb-18 color-slate-900">{document.location}</p>
        <p className="map-settings-popup__section-title body2-sb-16 color-slate-900">기본 레이어</p>
        <ul className="map-settings-popup__layers">
          {document.baseLayers.map((layer) => (
            <li key={layer.label} className="map-settings-popup__layer">
              <span className={`map-layer-icon map-layer-icon--${layer.tone}`} aria-hidden="true"></span>
              <span className="body3-r-14 color-slate-900">{layer.label}</span>
            </li>
          ))}
        </ul>
        {checkedLayers.length > 0 && (
          <div className="map-settings-popup__active-section">
            <p className="map-settings-popup__section-title body2-sb-16 color-slate-900">현재 켜진 레이어</p>
            <ul className="map-settings-popup__layers">
              {checkedLayers.map((layer) => (
                <li key={layer.pathKey} className="map-settings-popup__layer">
                  <span className="map-layer-icon map-layer-icon--survey" aria-hidden="true"></span>
                  <span className="body3-r-14 color-slate-900">{layer.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="map-settings-popup__foot">
        <p className="body3-r-14 color-slate-500 line-160">
          고급 레이어 설정이 필요할 경우 레이어 확대하여 사용 부탁드립니다.
        </p>
      </div>
    </section>
  );
}

function MapSettingsPanel({
  document,
  checkedLayers,
  layerRoots,
  advancedTab,
  openNodes,
  onAdvancedTabChange,
  onToggleNode,
  onToggleLayerChecked,
  onCollapse,
}: {
  document: MapDocument;
  checkedLayers: CheckedLayerItem[];
  layerRoots: MapLayerNode[];
  advancedTab: string;
  openNodes: Record<string, boolean>;
  onAdvancedTabChange: (tab: string) => void;
  onToggleNode: (pathKey: string) => void;
  onToggleLayerChecked: (path: number[]) => void;
  onCollapse: () => void;
}) {
  return (
    <aside className="map-settings-panel" aria-label="지도 설정 패널">
      <div className="map-settings-panel__head">
        <h2 className="body2-sb-16 color-slate-900">지도 설정</h2>
        <motion.button
          className="map-panel__icon-btn"
          type="button"
          aria-label="지도 설정 접기"
          onClick={onCollapse}
          {...tapScale}
        >
          <i className="align-corner-icon" aria-hidden="true"></i>
        </motion.button>
      </div>

      <div className="map-settings-panel__body">
        <p className="map-settings-panel__location heading10-sb-20 color-slate-900">{document.location}</p>

        <section className="map-settings-panel__section">
          <p className="map-settings-panel__section-title body2-sb-16 color-slate-900">기본 레이어</p>
          <ul className="map-settings-popup__layers mb-16">
            {document.baseLayers.map((layer) => (
              <li key={layer.label} className="map-settings-popup__layer">
                <span className={`map-layer-icon map-layer-icon--${layer.tone}`} aria-hidden="true"></span>
                <span className="body2-r-16 color-slate-900">{layer.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="map-settings-panel__section map-settings-panel__section--divided">
          <p className="map-settings-panel__section-title body2-sb-16 color-slate-900">현재 켜진 레이어</p>
          {checkedLayers.length > 0 ? (
            <ul className="map-settings-panel__active-list">
              {checkedLayers.map((layer) => {
                const checkboxId = `map-active-layer-${layer.pathKey}`;

                return (
                  <li key={layer.pathKey} className="map-settings-panel__checkbox-row">
                    <input
                      id={checkboxId}
                      className="checkbox-basic checkbox-basic-sm"
                      type="checkbox"
                      checked
                      onChange={() => onToggleLayerChecked(layer.path)}
                    />
                    <label htmlFor={checkboxId} className="map-settings-panel__checkbox-label">
                      <span className="map-layer-icon map-layer-icon--survey" aria-hidden="true"></span>
                      <span className="body2-r-16 color-slate-900">{layer.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="body3-r-14 color-slate-500">켜진 레이어가 없습니다.</p>
          )}
        </section>

        <section className="map-settings-panel__section map-settings-panel__section--divided">
          <p className="map-settings-panel__section-title body2-sb-16 color-slate-900">고급 레이어</p>
          <div className="map-settings-panel__tabs radio-toggle-group" role="tablist" aria-label="고급 레이어 분류">
            {document.advancedTabs.map((tab) => (
              <motion.label
                key={tab}
                className="map-settings-panel__tab radio-toggle-label"
                role="tab"
                aria-selected={advancedTab === tab}
                {...tapScale}
              >
                <input
                  className="radio-toggle"
                  type="radio"
                  name="map-advanced-layer-tab"
                  value={tab}
                  checked={advancedTab === tab}
                  onChange={() => onAdvancedTabChange(tab)}
                />
                <span className="body3-m-14">{tab}</span>
              </motion.label>
            ))}
          </div>

          <div className="search-wrapper mb-16">
            <label className="blind" htmlFor="map-layer-search">
              레이어 검색
            </label>
            <div className="search-48 flex align-center gap-10 px-16 bg-white">
              <i className="search-icon-40" aria-hidden="true"></i>
              <input
                id="map-layer-search"
                className="main-search__input body2-r-16 flex-1"
                type="search"
                placeholder="레이어 검색"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="map-settings-panel__accordion">
            {layerRoots.map((node, index) => (
              <MapLayerTreeNode
                key={`${node.label}-${index}`}
                node={node}
                depth={1}
                path={[index]}
                openNodes={openNodes}
                onToggleNode={onToggleNode}
                onToggleLayerChecked={onToggleLayerChecked}
              />
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function MapLayerTreeNode({
  node,
  depth,
  path,
  openNodes,
  onToggleNode,
  onToggleLayerChecked,
}: {
  node: MapLayerNode;
  depth: number;
  path: number[];
  openNodes: Record<string, boolean>;
  onToggleNode: (pathKey: string) => void;
  onToggleLayerChecked: (path: number[]) => void;
}) {
  const pathKey = path.join("-");
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isOpen = openNodes[pathKey] ?? false;
  const checkedCount = countCheckedInTree(node);
  const showCount = shouldShowCheckedCount(node, depth, checkedCount);

  const checkboxId = getLayerCheckboxId(path);

  if (!hasChildren) {
    return (
      <div className={`map-layer-node__leaf map-layer-node__leaf--depth-${depth}`}>
        <input
          id={checkboxId}
          className="checkbox-basic checkbox-basic-sm"
          type="checkbox"
          checked={node.checked ?? false}
          onChange={() => onToggleLayerChecked(path)}
        />
        <label htmlFor={checkboxId} className="map-layer-node__checkbox-label">
          <span className="map-layer-icon map-layer-icon--survey" aria-hidden="true"></span>
          <span className="body2-r-16 color-slate-900">{node.label}</span>
        </label>
      </div>
    );
  }

  if (depth >= 3) {
    return (
      <div className={`map-layer-node map-layer-node--depth-${depth}`}>
        <div className={`map-layer-node__branch map-layer-node__branch--depth-${depth}`}>
          <input
            id={checkboxId}
            className="checkbox-basic checkbox-basic-sm"
            type="checkbox"
            checked={node.checked ?? false}
            onChange={() => onToggleLayerChecked(path)}
          />
          <label htmlFor={checkboxId} className="map-layer-node__checkbox-label">
            <span className="map-layer-icon map-layer-icon--survey" aria-hidden="true"></span>
            <span className="body2-r-16 color-slate-900">{node.label}</span>
          </label>
          <button
            className="map-layer-node__toggle"
            type="button"
            aria-expanded={isOpen}
            aria-label={`${node.label} 하위 레이어 ${isOpen ? "접기" : "펼치기"}`}
            onClick={() => onToggleNode(pathKey)}
          >
            <i className={isOpen ? "chevron-up-slate-700" : "chevron-down-slate-700"} aria-hidden="true"></i>
          </button>
        </div>

        {isOpen && (
          <div className={`map-layer-node__body map-layer-node__body--depth-${depth}`}>
            {node.children?.map((child, index) => (
              <MapLayerTreeNode
                key={`${pathKey}-${child.label}-${index}`}
                node={child}
                depth={depth + 1}
                path={[...path, index]}
                openNodes={openNodes}
                onToggleNode={onToggleNode}
                onToggleLayerChecked={onToggleLayerChecked}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isDepth2Active = depth === 2 && isOpen;

  return (
    <div className={`map-layer-node map-layer-node--depth-${depth}`}>
      <button
        className={`map-layer-node__head map-layer-node__head--depth-${depth} ${isDepth2Active ? "active bg-slate-50" : ""}`}
        type="button"
        aria-expanded={isOpen}
        onClick={() => onToggleNode(pathKey)}
      >
        <span className="body2-m-16 color-slate-900">
          {node.label}
          {showCount && <strong className="color-blue-500"> {checkedCount}</strong>}
        </span>
        <i className={isOpen ? "chevron-up-slate-700" : "chevron-down-slate-700"} aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div className={`map-layer-node__body map-layer-node__body--depth-${depth}`}>
          {node.children?.map((child, index) => (
            <MapLayerTreeNode
              key={`${pathKey}-${child.label}-${index}`}
              node={child}
              depth={depth + 1}
              path={[...path, index]}
              openNodes={openNodes}
              onToggleNode={onToggleNode}
              onToggleLayerChecked={onToggleLayerChecked}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getLayerCheckboxId(path: number[]) {
  return `map-layer-${path.join("-")}`;
}

function shouldShowCheckedCount(_node: MapLayerNode, depth: number, checkedCount: number) {
  if (checkedCount <= 0) return false;
  return depth === 1 || depth === 2;
}

function countCheckedInTree(node: MapLayerNode): number {
  if (!node.children?.length) {
    return node.checked ? 1 : 0;
  }

  return node.children.reduce((count, child) => count + countCheckedInTree(child), 0);
}

function cloneLayerTree(nodes: MapLayerNode[]): MapLayerNode[] {
  return nodes.map((node) => ({
    ...node,
    checked: node.checked ?? false,
    children: node.children ? cloneLayerTree(node.children) : undefined,
  }));
}

function collectCheckedLayers(nodes: MapLayerNode[], parentPath: number[] = []): CheckedLayerItem[] {
  return nodes.flatMap((node, index) => {
    const path = [...parentPath, index];
    const pathKey = path.join("-");

    if (!node.children?.length) {
      return node.checked ? [{ label: node.label, path, pathKey }] : [];
    }

    return collectCheckedLayers(node.children, path);
  });
}

function trimToMaxActiveLayers(roots: MapLayerNode[], order: string[]) {
  const checked = collectCheckedLayers(roots);
  const orderMap = new Map(order.map((pathKey, index) => [pathKey, index]));
  const keepKeys = new Set(
    [...checked]
      .sort((a, b) => (orderMap.get(a.pathKey) ?? Number.MAX_SAFE_INTEGER) - (orderMap.get(b.pathKey) ?? Number.MAX_SAFE_INTEGER))
      .slice(0, MAX_ACTIVE_LAYERS)
      .map((item) => item.pathKey),
  );

  let nextRoots = roots;
  checked
    .filter((item) => !keepKeys.has(item.pathKey))
    .forEach((item) => {
      nextRoots = toggleNodeChecked(nextRoots, item.path);
    });

  return {
    roots: nextRoots,
    order: order.filter((pathKey) => keepKeys.has(pathKey)),
  };
}

function getNodeAtPath(nodes: MapLayerNode[], path: number[]): MapLayerNode | undefined {
  if (path.length === 0) return undefined;

  const [index, ...rest] = path;
  const node = nodes[index];
  if (!node) return undefined;
  if (rest.length === 0) return node;

  return node.children ? getNodeAtPath(node.children, rest) : undefined;
}

function toggleNodeChecked(nodes: MapLayerNode[], path: number[]): MapLayerNode[] {
  if (path.length === 0) return nodes;

  const [index, ...rest] = path;

  return nodes.map((node, nodeIndex) => {
    if (nodeIndex !== index) return node;

    if (rest.length === 0) {
      return { ...node, checked: !(node.checked ?? false) };
    }

    return {
      ...node,
      children: node.children ? toggleNodeChecked(node.children, rest) : node.children,
    };
  });
}
