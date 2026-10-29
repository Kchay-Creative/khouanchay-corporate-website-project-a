"use client";
import { useCallback, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExpandableSearchBar } from "@/components/ui/expandable-search-bar";
import { useI18n } from "@/i18n/provider";
import {
  assignedPerson,
  positionTitle,
  sortedPositions,
} from "@/features/organization/model";
import { useOrganizationData } from "@/features/organization/storage";
import {
  chartViewBySlug,
  chartViewName,
  chartViewTrail,
  positionIdsForView,
} from "@/features/chart-views/model";
import { useChartViewData } from "@/features/chart-views/storage";
import type { ChartView } from "@/features/chart-views/types";
import { OrganizationChart } from "./organization-chart";
import { OrganizationDetailOverlay } from "./organization-detail-overlay";

export function OrganizationNotice() {
  const { dictionary: d } = useI18n();
  return (
    <div className="org-demo-notice" role="note">
      <strong>{d.organization.demoNoticeTitle}</strong>
      <p>{d.organization.demoNoticeBody}</p>
      <small>{d.organization.localOnly}</small>
    </div>
  );
}

export function OrganizationView() {
  const { locale, dictionary: d } = useI18n();
  const { data, ready } = useOrganizationData();
  const { data: chartViewData } = useChartViewData(data);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = chartViewBySlug(chartViewData, searchParams.get("chart"));
  const activePositionIds = useMemo(
    () => positionIdsForView(chartViewData, activeView.id),
    [activeView.id, chartViewData],
  );
  const trail = useMemo(
    () => chartViewTrail(chartViewData, activeView.id),
    [activeView.id, chartViewData],
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);
  const selectPosition = useCallback((positionId: string) => {
    setSelectedId(positionId);
    setDetailsOpen(true);
  }, []);
  const handleSearchOpenChange = useCallback((open: boolean) => {
    setSearchOpen(open);
    if (!open) setQuery("");
  }, []);
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const matches = useMemo(
    () =>
      normalizedQuery
        ? sortedPositions(data).filter((position) => {
            if (!activePositionIds.has(position.id)) return false;
            const person = assignedPerson(data, position.id);
            const department =
              position.departmentTranslations?.[locale] ??
              position.department ??
              "";
            return `${positionTitle(position, locale)} ${position.title} ${department} ${person?.displayName ?? ""}`
              .toLocaleLowerCase(locale)
              .includes(normalizedQuery);
          })
        : [],
    [activePositionIds, data, locale, normalizedQuery],
  );
  const selected =
    data.positions.find((position) => position.id === selectedId) ?? null;
  const selectedPerson = selected ? assignedPerson(data, selected.id) : null;
  const parent = selected?.parentId
    ? (data.positions.find((position) => position.id === selected.parentId) ??
      null)
    : null;
  const directReports = selected
    ? data.positions.filter((position) => position.parentId === selected.id)
    : [];

  const openChartView = useCallback(
    (view: ChartView) => {
      setDetailsOpen(false);
      setSelectedId(null);
      setQuery("");
      setSearchOpen(false);
      router.push(`/management?chart=${encodeURIComponent(view.slug)}`, {
        scroll: false,
      });
    },
    [router],
  );

  return (
    <div className="org-management-view">
      <div className="org-management-search">
        <ExpandableSearchBar
          value={query}
          onValueChange={setQuery}
          open={searchOpen}
          onOpenChange={handleSearchOpenChange}
          placeholder={d.organization.searchPlaceholder}
          ariaLabel={d.organization.searchLabel}
          closeLabel={d.organization.closeSearch}
          expandDirection="right"
        />
        {searchOpen && normalizedQuery ? (
          <div className="org-search-results org-search-results-floating">
            <strong>{d.organization.searchResults}</strong>
            {matches.length > 0 ? (
              <div className="org-result-list">
                {matches.map((position) => (
                  <button
                    type="button"
                    key={position.id}
                    onClick={() => {
                      handleSearchOpenChange(false);
                      selectPosition(position.id);
                    }}
                  >
                    <span>{positionTitle(position, locale)}</span>
                    <small>
                      {assignedPerson(data, position.id)?.displayName ??
                        d.organization.vacant}
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <p>{d.organization.noMatches}</p>
            )}
          </div>
        ) : null}
      </div>
      {!ready ? (
        <div className="org-loading" role="status">
          {d.organization.loading}
        </div>
      ) : (
        <>
          <nav className="org-chart-view-nav" aria-label={d.organization.chartViewNavigation}>
            {trail.map((view, index) => (
              <span key={view.id}>
                {index > 0 ? <ChevronRight aria-hidden="true" /> : null}
                {view.id === activeView.id ? (
                  <strong>{chartViewName(view, locale)}</strong>
                ) : (
                  <button type="button" onClick={() => openChartView(view)}>
                    {chartViewName(view, locale)}
                  </button>
                )}
              </span>
            ))}
          </nav>
          <section className="org-chart-panel org-chart-panel-primary">
            <OrganizationChart
              data={data}
              selectedId={selected?.id ?? null}
              matchIds={matches.map((position) => position.id)}
              onSelect={selectPosition}
              pannable
              chartView={activeView}
              chartViewData={chartViewData}
              onOpenLinkedView={openChartView}
              heading={
                <>
                  <h1>{d.organization.pageTitle}</h1>
                  <p>{d.organization.pageDescription}</p>
                </>
              }
            />
          </section>
          <OrganizationDetailOverlay
            open={detailsOpen && Boolean(selected)}
            position={selected}
            person={selectedPerson}
            parent={parent}
            directReportCount={directReports.length}
            onClose={closeDetails}
          />
        </>
      )}
    </div>
  );
}
