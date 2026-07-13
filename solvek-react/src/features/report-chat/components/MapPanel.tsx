import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { KeyboardEvent, PointerEvent } from "react";
import * as L from "leaflet";

import { mapDocument } from "../data";
import { springSoft, tapScale } from "../../report-search/motionConfig";
import type { MapDocument, MapLayerNode } from "../types";
import { ResizeHandle } from "./ResizeHandle";

export type MapOverlayRequest = {
  requestId: string;
  candidateId: number;
  imageUrl: string;
  title: string;
  reportTitle: string;
  pageLabel: string;
};

type MapPanelProps = {
  embedded?: boolean;
  width?: number;
  isResizing?: boolean;
  isResizeHover?: boolean;
  overlayRequest?: MapOverlayRequest | null;
  onResizeStart?: (event: PointerEvent<HTMLDivElement>) => void;
  onResizeEnter?: () => void;
  onResizeLeave?: () => void;
};

type MapTypeId = "general" | "soft" | "satellite" | "terrain";
type MapToolId = "radius" | "distance" | "area" | "print";

type CheckedLayerItem = {
  label: string;
  path: number[];
  pathKey: string;
};

type ReportOverlayState = {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

type ReportOverlayDrag =
  | {
      mode: "move";
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
    }
  | {
      mode: "resize";
      corner: "nw" | "ne" | "sw" | "se";
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
      aspectRatio: number;
    }
  | {
      mode: "rotate";
      centerX: number;
      centerY: number;
      startAngle: number;
      startRotation: number;
    };

type AppliedReportOverlay = {
  container: HTMLDivElement;
  bounds: L.LatLngBounds;
  update: () => void;
};

type SettingsPopupDrag = {
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

const MAX_ACTIVE_LAYERS = 5;
const INITIAL_MAP_CENTER: L.LatLngExpression = [35.272, 128.406];
const INITIAL_MAP_ZOOM = 14;
const MAP_MARKER_POSITION: L.LatLngExpression = [35.272, 128.406];
const MAP_PIN_ICON_URL = "./image/icon/Pin.svg";
const MAP_LOCATION_ADDRESS = mapDocument.location;
const MAP_MARKER_REPORT_INFO = "함안 윤내리 토기가마 I · 도면 14. 1~2호 토기가마 평면도";
const REPORT_OVERLAY_IMAGE_URL = "./image/sample/report-page-map.svg";
const REPORT_OVERLAY_INITIAL: ReportOverlayState = {
  visible: false,
  x: 430,
  y: 210,
  width: 250,
  height: 350,
  rotation: -25,
  opacity: 0.4,
};
const REPORT_OVERLAY_MIN_WIDTH = 120;
const REPORT_OVERLAY_MIN_HEIGHT = 160;
const SETTINGS_POPUP_DEFAULT_POSITION = { x: 16, y: 16 };
const SETTINGS_POPUP_WIDTH = 280;
const SETTINGS_POPUP_MIN_VISIBLE = 80;
const SETTINGS_POPUP_MARGIN = 8;

const mapTypes: Array<{ id: MapTypeId; label: string }> = [
  { id: "general", label: "일반" },
  { id: "soft", label: "담백" },
  { id: "satellite", label: "위성" },
  { id: "terrain", label: "지형" },
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
  overlayRequest = null,
  onResizeStart,
  onResizeEnter,
  onResizeLeave,
}: MapPanelProps) {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const [mapType, setMapType] = useState<MapTypeId>("general");
  const [activeTool, setActiveTool] = useState<MapToolId | null>(null);
  const [displayLocation, setDisplayLocation] = useState(mapDocument.location);
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const reverseGeocodeTimerRef = useRef<number | null>(null);
  const reverseGeocodeSeqRef = useRef(0);
  const reportOverlayDragRef = useRef<ReportOverlayDrag | null>(null);
  const settingsPopupDragRef = useRef<SettingsPopupDrag | null>(null);
  const reportOverlayRef = useRef<HTMLDivElement>(null);
  const appliedReportImageOverlayRef = useRef<AppliedReportOverlay | null>(null);
  const applyToastTimerRef = useRef<number | null>(null);
  const [reportOverlay, setReportOverlay] = useState<ReportOverlayState>(REPORT_OVERLAY_INITIAL);
  const [isImageAdjustExpanded, setIsImageAdjustExpanded] = useState(false);
  const [isReportOverlayApplied, setIsReportOverlayApplied] = useState(false);
  const [isApplyToastVisible, setIsApplyToastVisible] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [settingsPopupPosition, setSettingsPopupPosition] = useState(SETTINGS_POPUP_DEFAULT_POSITION);
  checkedOrderRef.current = checkedOrder;

  useEffect(() => {
    if (!overlayRequest) {
      removeAppliedReportImageOverlay();
      setReportOverlay((current) => ({ ...current, visible: false }));
      setIsImageAdjustExpanded(false);
      setIsReportOverlayApplied(false);
      setIsApplyToastVisible(false);
      return;
    }

    const initialOverlay = { ...REPORT_OVERLAY_INITIAL, visible: true };
    removeAppliedReportImageOverlay();
    setReportOverlay(initialOverlay);
    setIsImageAdjustExpanded(false);
    setIsReportOverlayApplied(true);
    setIsApplyToastVisible(false);

    const map = leafletMapRef.current;
    if (map) {
      createAppliedReportImageOverlay(getReportOverlayBounds(initialOverlay), initialOverlay);
    }
  }, [overlayRequest?.requestId]);

  useEffect(() => {
    return () => {
      if (applyToastTimerRef.current !== null) {
        window.clearTimeout(applyToastTimerRef.current);
      }

      removeAppliedReportImageOverlay();
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: INITIAL_MAP_CENTER,
      zoom: INITIAL_MAP_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    const tileConfig = getTileLayerConfig(mapType);
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);

    L.circle(MAP_MARKER_POSITION, {
      radius: 170,
      color: "#E11D48",
      weight: 2,
      dashArray: "6 5",
      fillColor: "#E11D48",
      fillOpacity: 0.12,
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl: MAP_PIN_ICON_URL,
      iconSize: [28, 35],
      iconAnchor: [14, 35],
      tooltipAnchor: [0, -32],
    });

    const marker = L.marker(MAP_MARKER_POSITION, {
      icon: markerIcon,
      keyboard: true,
      title: MAP_LOCATION_ADDRESS,
    })
      .bindTooltip(getMarkerTooltipHtml(MAP_LOCATION_ADDRESS), {
        className: "map-panel__marker-tooltip",
        direction: "top",
        opacity: 1,
        sticky: true,
      })
      .addTo(map);
    markerRef.current = marker;

    const updateLocationDisplay = (address: string) => {
      setDisplayLocation(address);
    };

    const scheduleReverseGeocode = (center: L.LatLng) => {
      if (reverseGeocodeTimerRef.current !== null) {
        window.clearTimeout(reverseGeocodeTimerRef.current);
      }

      reverseGeocodeTimerRef.current = window.setTimeout(async () => {
        const requestSeq = reverseGeocodeSeqRef.current + 1;
        reverseGeocodeSeqRef.current = requestSeq;

        const address = await reverseGeocodeAddress(center);
        if (reverseGeocodeSeqRef.current !== requestSeq) return;

        updateLocationDisplay(address ?? getFallbackMapAddress(center));
      }, 550);
    };

    const syncLocation = () => {
      const center = map.getCenter();
      updateLocationDisplay(getFallbackMapAddress(center));
      scheduleReverseGeocode(center);
    };

    map.on("moveend", syncLocation);
    map.on("zoomend", syncLocation);
    syncLocation();

    leafletMapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (reverseGeocodeTimerRef.current !== null) {
        window.clearTimeout(reverseGeocodeTimerRef.current);
        reverseGeocodeTimerRef.current = null;
      }
      map.off("moveend", syncLocation);
      map.off("zoomend", syncLocation);
      map.remove();
      leafletMapRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!overlayRequest || !isReportOverlayApplied || appliedReportImageOverlayRef.current || !leafletMapRef.current) return;

    const initialOverlay = reportOverlay.visible ? reportOverlay : { ...REPORT_OVERLAY_INITIAL, visible: true };
    createAppliedReportImageOverlay(getReportOverlayBounds(initialOverlay), initialOverlay);
  }, [isMapReady, overlayRequest?.requestId, isReportOverlayApplied]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const tileConfig = getTileLayerConfig(mapType);
    tileLayerRef.current?.remove();
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
  }, [mapType]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timer = window.setTimeout(() => map.invalidateSize(), 260);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [embedded, width, isResizing, isSettingsExpanded]);

  useEffect(() => {
    if (!mapContainerRef.current || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      leafletMapRef.current?.invalidateSize();
    });

    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

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

  const updateReportOverlay = (next: Partial<ReportOverlayState>) => {
    setReportOverlay((current) => ({ ...current, ...next }));
  };

  const removeAppliedReportImageOverlay = () => {
    const appliedOverlay = appliedReportImageOverlayRef.current;
    const map = leafletMapRef.current;

    if (appliedOverlay && map) {
      map.off("zoomend viewreset resize moveend", appliedOverlay.update);
      appliedOverlay.container.remove();
    }

    appliedReportImageOverlayRef.current = null;
  };

  const getReportOverlayBounds = (overlay: ReportOverlayState) => {
    const map = leafletMapRef.current;
    if (!map) return L.latLngBounds(INITIAL_MAP_CENTER, INITIAL_MAP_CENTER);

    const northWest = map.containerPointToLatLng(L.point(overlay.x, overlay.y));
    const southEast = map.containerPointToLatLng(L.point(overlay.x + overlay.width, overlay.y + overlay.height));

    return L.latLngBounds(northWest, southEast);
  };

  const clampSettingsPopupPosition = (x: number, y: number) => {
    const viewportRect = mapContainerRef.current?.getBoundingClientRect();
    if (!viewportRect) return { x, y };

    return {
      x: Math.min(
        Math.max(SETTINGS_POPUP_MARGIN, x),
        Math.max(SETTINGS_POPUP_MARGIN, viewportRect.width - SETTINGS_POPUP_WIDTH - SETTINGS_POPUP_MARGIN),
      ),
      y: Math.min(
        Math.max(SETTINGS_POPUP_MARGIN, y),
        Math.max(SETTINGS_POPUP_MARGIN, viewportRect.height - SETTINGS_POPUP_MIN_VISIBLE),
      ),
    };
  };

  const startSettingsPopupDrag = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, input, label, a")) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    settingsPopupDragRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: settingsPopupPosition.x,
      startY: settingsPopupPosition.y,
    };
  };

  const moveSettingsPopupDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = settingsPopupDragRef.current;
    if (!drag) return;

    event.preventDefault();
    event.stopPropagation();

    const nextX = drag.startX + event.clientX - drag.startClientX;
    const nextY = drag.startY + event.clientY - drag.startClientY;
    setSettingsPopupPosition(clampSettingsPopupPosition(nextX, nextY));
  };

  const endSettingsPopupDrag = (event: PointerEvent<HTMLElement>) => {
    if (!settingsPopupDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    settingsPopupDragRef.current = null;
  };

  const createAppliedReportImageOverlay = (bounds: L.LatLngBounds, overlay = reportOverlay) => {
    const map = leafletMapRef.current;
    if (!map) return;

    removeAppliedReportImageOverlay();

    const container = document.createElement("div");
    const image = document.createElement("img");
    container.className = "map-applied-report-overlay";
    image.src = overlayRequest?.imageUrl ?? REPORT_OVERLAY_IMAGE_URL;
    image.alt = "";
    image.draggable = false;
    image.style.opacity = String(overlay.opacity);
    image.style.transform = `rotate(${overlay.rotation}deg)`;
    container.appendChild(image);
    map.getPanes().overlayPane.appendChild(container);

    const update = () => {
      const northWestPoint = map.latLngToLayerPoint(bounds.getNorthWest());
      const southEastPoint = map.latLngToLayerPoint(bounds.getSouthEast());
      L.DomUtil.setPosition(container, northWestPoint);
      container.style.width = `${Math.max(1, southEastPoint.x - northWestPoint.x)}px`;
      container.style.height = `${Math.max(1, southEastPoint.y - northWestPoint.y)}px`;
    };

    update();
    map.on("zoomend viewreset resize moveend", update);
    appliedReportImageOverlayRef.current = { container, bounds, update };
  };

  const resetReportOverlay = () => {
    removeAppliedReportImageOverlay();
    setReportOverlay({ ...REPORT_OVERLAY_INITIAL, visible: true });
    setIsReportOverlayApplied(false);
    setIsImageAdjustExpanded(true);
  };

  const deleteReportOverlay = () => {
    removeAppliedReportImageOverlay();
    setReportOverlay((current) => ({ ...current, visible: false }));
    setIsImageAdjustExpanded(false);
    setIsReportOverlayApplied(false);
    setIsApplyToastVisible(false);
  };

  const applyReportOverlay = () => {
    const map = leafletMapRef.current;
    if (map) {
      createAppliedReportImageOverlay(getReportOverlayBounds(reportOverlay));
    }

    setIsReportOverlayApplied(true);
    setIsImageAdjustExpanded(false);
    setIsApplyToastVisible(true);

    if (applyToastTimerRef.current !== null) {
      window.clearTimeout(applyToastTimerRef.current);
    }

    applyToastTimerRef.current = window.setTimeout(() => {
      setIsApplyToastVisible(false);
      applyToastTimerRef.current = null;
    }, 1600);
  };

  const editAppliedReportOverlay = () => {
    const map = leafletMapRef.current;
    const bounds = appliedReportImageOverlayRef.current?.bounds;

    if (map && bounds) {
      const northWestPoint = map.latLngToContainerPoint(bounds.getNorthWest());
      const southEastPoint = map.latLngToContainerPoint(bounds.getSouthEast());

      setReportOverlay((current) => ({
        ...current,
        visible: true,
        x: northWestPoint.x,
        y: northWestPoint.y,
        width: Math.max(REPORT_OVERLAY_MIN_WIDTH, southEastPoint.x - northWestPoint.x),
        height: Math.max(REPORT_OVERLAY_MIN_HEIGHT, southEastPoint.y - northWestPoint.y),
      }));
    }

    removeAppliedReportImageOverlay();
    setIsReportOverlayApplied(false);
    setIsImageAdjustExpanded(true);
    setIsApplyToastVisible(false);
  };

  const startReportOverlayMove = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    reportOverlayDragRef.current = {
      mode: "move",
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: reportOverlay.x,
      startY: reportOverlay.y,
    };
  };

  const startReportOverlayResize =
    (corner: "nw" | "ne" | "sw" | "se") => (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      reportOverlayDragRef.current = {
        mode: "resize",
        corner,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: reportOverlay.x,
        startY: reportOverlay.y,
        startWidth: reportOverlay.width,
        startHeight: reportOverlay.height,
        aspectRatio: reportOverlay.width / reportOverlay.height,
      };
    };

  const startReportOverlayRotate = (event: PointerEvent<HTMLButtonElement>) => {
    const overlayRect = reportOverlayRef.current?.getBoundingClientRect();
    if (!overlayRect) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const centerX = overlayRect.left + overlayRect.width / 2;
    const centerY = overlayRect.top + overlayRect.height / 2;
    reportOverlayDragRef.current = {
      mode: "rotate",
      centerX,
      centerY,
      startAngle: getPointerAngle(event.clientX, event.clientY, centerX, centerY),
      startRotation: reportOverlay.rotation,
    };
  };

  const moveReportOverlayPointer = (event: PointerEvent<HTMLElement>) => {
    const drag = reportOverlayDragRef.current;
    if (!drag) return;

    event.preventDefault();
    event.stopPropagation();

    if (drag.mode === "rotate") {
      const nextAngle = getPointerAngle(event.clientX, event.clientY, drag.centerX, drag.centerY);
      updateReportOverlay({ rotation: Math.round(drag.startRotation + nextAngle - drag.startAngle) });
      return;
    }

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;

    if (drag.mode === "move") {
      updateReportOverlay({
        x: drag.startX + deltaX,
        y: drag.startY + deltaY,
      });
      return;
    }

    if (drag.mode === "resize") {
      const widthFromX =
        drag.corner === "se" || drag.corner === "ne"
          ? drag.startWidth + deltaX
          : drag.startWidth - deltaX;
      const heightFromY =
        drag.corner === "se" || drag.corner === "sw"
          ? drag.startHeight + deltaY
          : drag.startHeight - deltaY;
      const widthByHeight = heightFromY * drag.aspectRatio;
      const nextWidth = Math.abs(deltaY) > Math.abs(deltaX) ? widthByHeight : widthFromX;
      const clampedWidth = Math.max(REPORT_OVERLAY_MIN_WIDTH, nextWidth);
      const nextHeight = Math.max(REPORT_OVERLAY_MIN_HEIGHT, clampedWidth / drag.aspectRatio);
      const nextX =
        drag.corner === "nw" || drag.corner === "sw"
          ? drag.startX + drag.startWidth - clampedWidth
          : drag.startX;
      const nextY =
        drag.corner === "nw" || drag.corner === "ne"
          ? drag.startY + drag.startHeight - nextHeight
          : drag.startY;

      updateReportOverlay({
        x: nextX,
        y: nextY,
        width: clampedWidth,
        height: nextHeight,
      });
    }
  };

  const endReportOverlayPointer = (event: PointerEvent<HTMLElement>) => {
    if (!reportOverlayDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    reportOverlayDragRef.current = null;
  };

  const handleReportOverlayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Backspace"].includes(event.key)) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Delete" || event.key === "Backspace") {
      deleteReportOverlay();
      return;
    }

    const step = event.shiftKey ? 16 : 4;
    const next = { x: reportOverlay.x, y: reportOverlay.y };
    if (event.key === "ArrowLeft") next.x -= step;
    if (event.key === "ArrowRight") next.x += step;
    if (event.key === "ArrowUp") next.y -= step;
    if (event.key === "ArrowDown") next.y += step;
    updateReportOverlay(next);
  };

  const nudgeReportOverlay = (deltaX: number, deltaY: number) => {
    updateReportOverlay({ x: reportOverlay.x + deltaX, y: reportOverlay.y + deltaY });
  };

  const resizeReportOverlay = (delta: number) => {
    const aspectRatio = reportOverlay.width / reportOverlay.height;
    const nextWidth = Math.max(REPORT_OVERLAY_MIN_WIDTH, reportOverlay.width + delta);
    updateReportOverlay({
      width: nextWidth,
      height: Math.max(REPORT_OVERLAY_MIN_HEIGHT, nextWidth / aspectRatio),
    });
  };

  const panelContent = (
    <div className={`map-panel map-panel--${mapType} h-full`}>
      <div className="map-panel__viewport">
        <div className="map-panel__canvas" aria-hidden="true">
          <div ref={mapContainerRef} className="map-panel__leaflet" />
        </div>

        <AnimatePresence>
          {isApplyToastVisible && (
            <motion.div
              key="map-apply-toast"
              className="toast active bg-blue-50 radius-md-8 shadow-lg px-16 py-8 flex align-center gap-6 z-index-10"
              role="status"
              initial={{ opacity: 0, y: -32, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -24, x: "-50%" }}
              transition={springSoft}
              style={{
                position: "absolute",
                top: "3.2rem",
                left: "50%",
                zIndex: 1300,
                visibility: "visible",
                transition: "none",
              }}
            >
              <span className="body2-sb-16 color-blue-500">적용 완료</span>
            </motion.div>
          )}
        </AnimatePresence>

        {reportOverlay.visible && !isReportOverlayApplied && (
          <div
            ref={reportOverlayRef}
            className="map-report-overlay"
            role="button"
            tabIndex={0}
            aria-label="보고서 도면 이미지. 방향키로 이동하고 Delete 키로 삭제할 수 있습니다."
            onPointerDown={startReportOverlayMove}
            onPointerMove={moveReportOverlayPointer}
            onPointerUp={endReportOverlayPointer}
            onPointerCancel={endReportOverlayPointer}
            onKeyDown={handleReportOverlayKeyDown}
            style={{
              left: `${reportOverlay.x}px`,
              top: `${reportOverlay.y}px`,
              width: `${reportOverlay.width}px`,
              height: `${reportOverlay.height}px`,
              transform: `rotate(${reportOverlay.rotation}deg)`,
            }}
          >
            <img
              src={overlayRequest?.imageUrl ?? REPORT_OVERLAY_IMAGE_URL}
              alt="보고서 도면 3. 조사지역 지질도"
              draggable={false}
              style={{ opacity: reportOverlay.opacity }}
            />
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <button
                key={`resize-${corner}`}
                className={`map-report-overlay__resize map-report-overlay__resize--${corner}`}
                type="button"
                aria-label="보고서 도면 이미지 크기 조정"
                onPointerDown={startReportOverlayResize(corner)}
                onPointerMove={moveReportOverlayPointer}
                onPointerUp={endReportOverlayPointer}
                onPointerCancel={endReportOverlayPointer}
              />
            ))}
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <button
                key={`rotate-${corner}`}
                className={`map-report-overlay__rotate map-report-overlay__rotate--${corner}`}
                type="button"
                aria-label="보고서 도면 이미지 회전"
                onPointerDown={startReportOverlayRotate}
                onPointerMove={moveReportOverlayPointer}
                onPointerUp={endReportOverlayPointer}
                onPointerCancel={endReportOverlayPointer}
              />
            ))}
            <button
              className="map-report-overlay__delete"
              type="button"
              aria-label="보고서 도면 이미지 삭제"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                deleteReportOverlay();
              }}
            >
              ×
            </button>
          </div>
        )}

        {isSettingsExpanded ? (
          <MapSettingsPanel
            document={mapDocument}
            displayLocation={displayLocation}
            checkedLayers={checkedLayers}
            layerRoots={layerRoots}
            advancedTab={advancedTab}
            openNodes={openNodes}
            onAdvancedTabChange={setAdvancedTab}
            onToggleNode={toggleNode}
            onToggleLayerChecked={toggleLayerChecked}
            onCollapse={() => setIsSettingsExpanded(false)}
          />
        ) : (
          <MapSettingsPopup
            document={mapDocument}
            displayLocation={displayLocation}
            checkedLayers={checkedLayers}
            position={settingsPopupPosition}
            onDragStart={startSettingsPopupDrag}
            onDragMove={moveSettingsPopupDrag}
            onDragEnd={endSettingsPopupDrag}
            onExpand={() => setIsSettingsExpanded(true)}
          />
        )}

        {reportOverlay.visible && isImageAdjustExpanded && (
          <div className="map-image-adjust-panel" aria-label="이미지 조정">
            <div className="map-image-adjust-panel__head">
              <h3 className="body2-sb-16 color-slate-900">이미지 조정</h3>
              <button
                className="map-panel__icon-btn"
                type="button"
                aria-label="이미지 조정 접기"
                onClick={() => setIsImageAdjustExpanded(false)}
              >
                <i className="align-corner-icon" aria-hidden="true"></i>
              </button>
            </div>
            <label className="map-image-adjust-panel__row">
              <span className="body3-r-14 color-slate-700">투명도</span>
              <input
                type="range"
                min="0.15"
                max="1"
                step="0.05"
                value={reportOverlay.opacity}
                onChange={(event) => updateReportOverlay({ opacity: Number(event.target.value) })}
              />
              <span className="body3-sb-14 color-slate-900">{Math.round(reportOverlay.opacity * 100)}%</span>
            </label>
            <div className="map-image-adjust-panel__row">
              <span className="body3-r-14 color-slate-700">위치</span>
              <span className="body3-r-14 color-slate-600">드래그 또는 방향키</span>
            </div>
            <div className="map-image-adjust-panel__row">
              <span className="body3-r-14 color-slate-700">미세 조정</span>
              <div className="map-image-adjust-panel__buttons">
                <button type="button" onClick={() => nudgeReportOverlay(-8, 0)} aria-label="왼쪽 이동">←</button>
                <button type="button" onClick={() => nudgeReportOverlay(0, -8)} aria-label="위로 이동">↑</button>
                <button type="button" onClick={() => nudgeReportOverlay(0, 8)} aria-label="아래로 이동">↓</button>
                <button type="button" onClick={() => nudgeReportOverlay(8, 0)} aria-label="오른쪽 이동">→</button>
              </div>
            </div>
            <div className="map-image-adjust-panel__row">
              <span className="body3-r-14 color-slate-700">크기</span>
              <div className="map-image-adjust-panel__buttons">
                <button type="button" onClick={() => resizeReportOverlay(20)} aria-label="이미지 확대">＋</button>
                <button type="button" onClick={() => resizeReportOverlay(-20)} aria-label="이미지 축소">－</button>
              </div>
            </div>
            <div className="map-image-adjust-panel__row">
              <span className="body3-r-14 color-slate-700">회전</span>
              <div className="map-image-adjust-panel__buttons">
                <button type="button" onClick={() => updateReportOverlay({ rotation: reportOverlay.rotation - 5 })} aria-label="반시계 방향 회전">↺</button>
                <button type="button" onClick={() => updateReportOverlay({ rotation: reportOverlay.rotation + 5 })} aria-label="시계 방향 회전">↻</button>
              </div>
              <span className="body3-sb-14 color-slate-900">{reportOverlay.rotation}°</span>
            </div>
            <div className="map-image-adjust-panel__foot flex">
              <button className="slate-50-button-32 flex-1" type="button" onClick={resetReportOverlay}>
                초기화
              </button>
              <button className="map-image-adjust-panel__delete slate-50-button-32 flex-1" type="button" onClick={deleteReportOverlay}>
                이미지 삭제
              </button>
              <button className="map-image-adjust-panel__apply blue-button-32 flex-1" type="button" onClick={applyReportOverlay}>
                이미지 적용 완료
              </button>
            </div>
          </div>
        )}

        {reportOverlay.visible && isReportOverlayApplied && (
          <div className="map-image-manage-panel" aria-label="적용된 이미지 관리">
            <div>
              <p className="body3-sb-14 color-slate-900">이미지 적용 완료</p>
              <p className="body4-r-13 color-slate-600">지도 위치에 고정됨</p>
            </div>
            <div className="map-image-manage-panel__actions">
              <button className="slate-50-button-32" type="button" onClick={editAppliedReportOverlay}>
                이미지 수정
              </button>
              <button className="map-image-adjust-panel__delete slate-50-button-32" type="button" onClick={deleteReportOverlay}>
                이미지 삭제
              </button>
            </div>
          </div>
        )}

        {reportOverlay.visible && !isImageAdjustExpanded && !isReportOverlayApplied && (
          <button
            className="map-image-adjust-panel map-image-adjust-panel--collapsed"
            type="button"
            aria-label={isReportOverlayApplied ? "적용된 이미지 다시 조정" : "이미지 조정 펼치기"}
            onClick={() => {
              setIsImageAdjustExpanded(true);
              setIsReportOverlayApplied(false);
            }}
          >
            <span className="body2-sb-16 color-slate-900">
              {isReportOverlayApplied ? "이미지 적용 완료" : "이미지 조정"}
            </span>
            <i className="align-corner-icon" aria-hidden="true"></i>
          </button>
        )}

        <div
          className="map-panel__map-type absolute"
          style={{ left: isSettingsExpanded ? "27.4rem" : "1.6rem", bottom: "1.6rem" }}
        >
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
              <motion.button
                className="map-control__btn"
                type="button"
                aria-label="확대"
                onClick={() => leafletMapRef.current?.zoomIn()}
                {...tapScale}
              >
                <i className="plus-icon" aria-hidden="true"></i>
              </motion.button>
              <motion.button
                className="map-control__btn"
                type="button"
                aria-label="축소"
                onClick={() => leafletMapRef.current?.zoomOut()}
                {...tapScale}
              >
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
  displayLocation,
  checkedLayers,
  position,
  onDragStart,
  onDragMove,
  onDragEnd,
  onExpand,
}: {
  document: MapDocument;
  displayLocation: string;
  checkedLayers: CheckedLayerItem[];
  position: { x: number; y: number };
  onDragStart: (event: PointerEvent<HTMLElement>) => void;
  onDragMove: (event: PointerEvent<HTMLElement>) => void;
  onDragEnd: (event: PointerEvent<HTMLElement>) => void;
  onExpand: () => void;
}) {
  return (
    <section
      className="map-settings-popup"
      aria-label="지도 설정"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      <div className="map-settings-popup__head" onPointerDown={onDragStart}>
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
        <p className="map-settings-popup__location body2-sb-16 color-slate-900">{displayLocation}</p>
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
  displayLocation,
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
  displayLocation: string;
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
        <p className="map-settings-panel__location body2-sb-16 color-slate-900">{displayLocation}</p>

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

function getTileLayerConfig(type: MapTypeId) {
  if (type === "terrain") {
    return {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "Map data: OpenStreetMap, SRTM | OpenTopoMap",
      maxZoom: 17,
    };
  }

  if (type === "satellite") {
    return {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles: Esri",
      maxZoom: 19,
    };
  }

  if (type === "soft") {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "OpenStreetMap contributors",
      maxZoom: 19,
    };
  }

  return {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "OpenStreetMap contributors",
    maxZoom: 19,
  };
}

function getPointerAngle(clientX: number, clientY: number, centerX: number, centerY: number) {
  return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
}

function getMarkerTooltipHtml(address: string) {
  return `
    <div class="map-marker-tooltip__eyebrow">대표 주소</div>
    <div class="map-marker-tooltip__address">${escapeHtml(address)}</div>
    <div class="map-marker-tooltip__meta">${escapeHtml(MAP_MARKER_REPORT_INFO)}</div>
  `;
}

function getFallbackMapAddress(center: L.LatLng) {
  const isNearHaman = center.lat >= 35.0 && center.lat <= 35.5 && center.lng >= 128.1 && center.lng <= 128.7;
  if (isNearHaman) return "함안군 가야읍 일대 주소 확인 중";
  return "현재 지도 중심 주소 확인 중";
}

async function reverseGeocodeAddress(center: L.LatLng) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: center.lat.toString(),
    lon: center.lng.toString(),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "ko",
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string | undefined>;
    };

    return formatReverseGeocodeAddress(data) ?? data.display_name ?? null;
  } catch {
    return null;
  }
}

function formatReverseGeocodeAddress(data: { display_name?: string; address?: Record<string, string | undefined> }) {
  const address = data.address;
  if (!address) return null;

  const region = address.state ?? address.province;
  const city = address.city ?? address.county ?? address.municipality;
  const town = address.town ?? address.village ?? address.suburb ?? address.quarter;
  const road = address.road;
  const houseNumber = address.house_number;
  const postcode = address.postcode;

  const parts = [region, city, town, road].filter(Boolean);
  if (houseNumber) parts.push(`${houseNumber}번지`);
  if (parts.length > 0) return parts.join(" ");

  return postcode ? `${postcode} 인근 주소` : null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
