"use client";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import {
  positionTitle,
} from "@/features/organization/model";
import {
  buildChartViewForest,
  chartViewName,
  linksForView,
} from "@/features/chart-views/model";
import type { ChartView, ChartViewData } from "@/features/chart-views/types";
import type {
  OrganizationData,
  OrganizationTreeNode,
} from "@/features/organization/types";
import { OrganizationProfileCard } from "./organization-profile-card";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.25;
const ZOOM_SENSITIVITY = 0.0015;
const WHEEL_DELTA_LINE = 1;
const WHEEL_DELTA_PAGE = 2;
function TreeNode({
  node,
  selectedId,
  matches,
  isRoot,
  onSelect,
  linkedViews,
  onOpenLinkedView,
}: {
  node: OrganizationTreeNode;
  selectedId: string | null;
  matches: Set<string>;
  isRoot: boolean;
  onSelect: (positionId: string) => void;
  linkedViews: Map<string, ChartView>;
  onOpenLinkedView?: (view: ChartView) => void;
}) {
  const { locale, dictionary: d } = useI18n();
  const title = positionTitle(node.position, locale);
  const personName = node.person?.displayName ?? null;
  const department =
    node.position.departmentTranslations?.[locale] ??
    node.position.department ??
    (node.position.unitType
      ? d.organization.unitTypes[node.position.unitType]
      : null) ??
    null;
  return (
    <li>
      <span className="org-node-connector" aria-hidden="true" />
      <div className="org-node-card-wrap">
        <OrganizationProfileCard
          positionId={node.position.id}
          personName={personName}
          positionTitle={title}
          department={department}
          imageUrl={node.person?.imageUrl}
          selected={selectedId === node.position.id}
          matched={matches.has(node.position.id)}
          eagerImage={isRoot}
          onSelect={onSelect}
        />
        {linkedViews.get(node.position.id) && onOpenLinkedView ? (
          <button
            className="org-chart-link-control"
            type="button"
            title={`${d.organization.openChart}: ${chartViewName(linkedViews.get(node.position.id)!, locale)}`}
            aria-label={`${d.organization.openChart}: ${chartViewName(linkedViews.get(node.position.id)!, locale)}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onOpenLinkedView(linkedViews.get(node.position.id)!);
            }}
          >
            <ArrowRight aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <TreeNode
              key={child.position.id}
              node={child}
              selectedId={selectedId}
              matches={matches}
              isRoot={false}
              onSelect={onSelect}
              linkedViews={linkedViews}
              onOpenLinkedView={onOpenLinkedView}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function OrganizationChart({
  data,
  selectedId,
  matchIds = [],
  onSelect,
  pannable = false,
  heading,
  chartView,
  chartViewData,
  onOpenLinkedView,
}: {
  data: OrganizationData;
  selectedId: string | null;
  matchIds?: string[];
  onSelect: (positionId: string) => void;
  pannable?: boolean;
  heading?: ReactNode;
  chartView: ChartView;
  chartViewData: ChartViewData;
  onOpenLinkedView?: (view: ChartView) => void;
}) {
  const { dictionary: d } = useI18n();
  const forest = useMemo(
    () => buildChartViewForest(data, chartViewData, chartView),
    [chartView, chartViewData, data],
  );
  const linkedViews = useMemo(
    () => linksForView(chartViewData, chartView.id),
    [chartView.id, chartViewData],
  );
  const matches = useMemo(() => new Set(matchIds), [matchIds]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const hasInitiallyCentered = useRef(false);
  const view = useRef({ x: 0, y: 0, scale: 1 });
  const activeViewId = useRef(chartView.id);
  const savedViews = useRef(new Map<string, typeof view.current>());
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const applyView = useCallback(() => {
    if (!treeRef.current) return;
    const { x, y, scale } = view.current;
    treeRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }, []);

  const resetView = useCallback(() => {
    const container = scrollRef.current;
    const treeElement = treeRef.current;
    if (!container || !treeElement) return;

    const previousTransform = treeElement.style.transform;
    treeElement.style.transform = "none";
    const viewport = container.getBoundingClientRect();
    const root = treeElement.querySelector<HTMLElement>(
      `[data-position-id="${CSS.escape(chartView.rootPositionId)}"]`,
    );
    if (!root) {
      treeElement.style.transform = previousTransform;
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const headingElement = treeElement.querySelector<HTMLElement>(
      ".org-chart-heading",
    );
    const verticalAnchorRect = (
      headingElement ?? root
    ).getBoundingClientRect();
    const headingTop =
      Number.parseFloat(
        getComputedStyle(container).getPropertyValue("--org-heading-top"),
      ) || 24;

    view.current = {
      x:
        viewport.width / 2 -
        (rootRect.left - viewport.left) -
        rootRect.width / 2,
      y: headingTop - (verticalAnchorRect.top - viewport.top),
      scale: 1,
    };
    applyView();
    hasInitiallyCentered.current = true;
  }, [applyView, chartView.rootPositionId]);

  useLayoutEffect(() => {
    if (!pannable || activeViewId.current === chartView.id) return;
    savedViews.current.set(activeViewId.current, { ...view.current });
    activeViewId.current = chartView.id;
    const saved = savedViews.current.get(chartView.id);
    if (saved) {
      view.current = { ...saved };
      applyView();
      hasInitiallyCentered.current = true;
      return;
    }
    hasInitiallyCentered.current = false;
    const frame = requestAnimationFrame(resetView);
    return () => cancelAnimationFrame(frame);
  }, [applyView, chartView.id, pannable, resetView]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (pannable) {
      if (hasInitiallyCentered.current) return;
      const frame = requestAnimationFrame(resetView);
      return () => cancelAnimationFrame(frame);
    }

    const targetId = selectedId ?? chartView.rootPositionId;
    const card = container.querySelector<HTMLElement>(
      `[data-position-id="${CSS.escape(targetId)}"]`,
    );
    if (!card) return;
    const left =
      card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [chartView.rootPositionId, pannable, resetView, selectedId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!pannable || !container) return;
    const chartContainer: HTMLDivElement = container;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const viewport = chartContainer.getBoundingClientRect();
      const pointerX = event.clientX - viewport.left;
      const pointerY = event.clientY - viewport.top;
      const normalizedDelta =
        event.deltaMode === WHEEL_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WHEEL_DELTA_PAGE
            ? event.deltaY * viewport.height
            : event.deltaY;
      const current = view.current;
      const nextScale = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          current.scale * Math.exp(-normalizedDelta * ZOOM_SENSITIVITY),
        ),
      );
      if (nextScale === current.scale) return;

      const chartX = (pointerX - current.x) / current.scale;
      const chartY = (pointerY - current.y) / current.scale;
      view.current = {
        x: pointerX - chartX * nextScale,
        y: pointerY - chartY * nextScale,
        scale: nextScale,
      };
      applyView();
    }

    chartContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => chartContainer.removeEventListener("wheel", handleWheel);
  }, [applyView, pannable]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!pannable) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (
      (event.target as HTMLElement).closest(
        ".org-card, .org-chart-link-control",
      )
    )
      return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.current.x,
      originY: view.current.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pannable || !drag.current || !treeRef.current) return;
    const deltaX = event.clientX - drag.current.startX;
    const deltaY = event.clientY - drag.current.startY;
    if (Math.hypot(deltaX, deltaY) > 4) drag.current.moved = true;
    view.current = {
      ...view.current,
      x: drag.current.originX + deltaX,
      y: drag.current.originY + deltaY,
    };
    applyView();
  }

  function finishDragging(event: React.PointerEvent<HTMLDivElement>) {
    if (!pannable || !drag.current) return;
    suppressClick.current = drag.current.moved;
    if (event.currentTarget.hasPointerCapture(drag.current.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.current.pointerId);
    }
    drag.current = null;
    event.currentTarget.classList.remove("is-dragging");
  }

  return (
    <div className={`org-chart-shell ${pannable ? "is-pannable" : ""}`}>
      {pannable ? (
        <button className="org-reset-view" type="button" onClick={resetView}>
          {d.organization.resetView}
        </button>
      ) : null}
      {!pannable ? (
        <p className="org-scroll-hint">{d.organization.scrollHint}</p>
      ) : null}
      <div
        className="org-chart-scroll"
        tabIndex={0}
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }}
      >
        <div
          className="org-tree"
          role="tree"
          aria-label={d.organization.chartAria}
          ref={treeRef}
        >
          {heading ? <div className="org-chart-heading">{heading}</div> : null}
          <ul>
            {forest.map((tree, index) => (
              <TreeNode
                key={tree.position.id}
                node={tree}
                selectedId={selectedId}
                matches={matches}
                isRoot={index === 0}
                onSelect={onSelect}
                linkedViews={linkedViews}
                onOpenLinkedView={onOpenLinkedView}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
