"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { formatMessage } from "@/i18n";
import { useI18n } from "@/i18n/provider";
import {
  chartViewName,
  createChartView,
  deleteChartView,
  disconnectedPositionsForView,
  moveChartView,
  orderedChartViews,
  positionIdsForView,
  setChartViewLink,
  setChartViewMembership,
  updateChartView,
} from "@/features/chart-views/model";
import type {
  ChartView,
  ChartViewData,
  ChartViewError,
  ChartViewResult,
} from "@/features/chart-views/types";
import {
  assignedPerson,
  positionTitle,
  sortedPositions,
} from "@/features/organization/model";
import type { OrganizationData } from "@/features/organization/types";

type ViewDraft = {
  nameLo: string;
  nameEn: string;
  rootPositionId: string;
  parentViewId: string;
  isActive: boolean;
};

function errorMessage(
  error: ChartViewError,
  d: ReturnType<typeof useI18n>["dictionary"],
): string {
  const messages: Record<ChartViewError, string> = {
    "name-required": d.organization.chartViewNameRequired,
    "view-not-found": d.organization.chartViewNotFound,
    "position-not-found": d.organization.chartViewPositionNotFound,
    "parent-view-not-found": d.organization.chartViewParentNotFound,
    "view-cycle": d.organization.chartViewCycle,
    "default-protected": d.organization.chartViewDefaultProtected,
    "root-membership-protected": d.organization.chartViewRootProtected,
    "invalid-data": d.organization.chartViewInvalid,
  };
  return messages[error];
}

function draftForView(
  view: ChartView | null,
  organization: OrganizationData,
  parentViewId: string,
  sourcePositionId: string | null,
): ViewDraft {
  const rootPositionId =
    view?.rootPositionId ?? sourcePositionId ?? organization.rootPositionId;
  const root = organization.positions.find(
    (position) => position.id === rootPositionId,
  );
  return {
    nameLo: view?.nameLo ?? (root ? positionTitle(root, "lo") : ""),
    nameEn: view?.nameEn ?? (root ? positionTitle(root, "en") : ""),
    rootPositionId,
    parentViewId: view?.parentViewId ?? parentViewId,
    isActive: view?.isActive ?? true,
  };
}

function ChartViewForm({
  view,
  organization,
  chartViews,
  parentViewId,
  sourcePositionId,
  onCommit,
  onCancel,
}: {
  view: ChartView | null;
  organization: OrganizationData;
  chartViews: ChartViewData;
  parentViewId: string;
  sourcePositionId: string | null;
  onCommit: (result: ChartViewResult, message: string) => void;
  onCancel: () => void;
}) {
  const { locale, dictionary: d } = useI18n();
  const [draft, setDraft] = useState(() =>
    draftForView(view, organization, parentViewId, sourcePositionId),
  );
  const orderedViews = orderedChartViews(chartViews, true);
  const positions = sortedPositions(organization);

  return (
    <form
      className="chart-view-form"
      onSubmit={(event) => {
        event.preventDefault();
        const result = view
          ? updateChartView(chartViews, organization, view.id, {
              ...draft,
              parentViewId: draft.parentViewId || null,
            })
          : createChartView(chartViews, organization, {
              nameLo: draft.nameLo,
              nameEn: draft.nameEn,
              rootPositionId: draft.rootPositionId,
              parentViewId: draft.parentViewId || null,
              sourcePositionId: sourcePositionId ?? undefined,
            });
        onCommit(
          result,
          view
            ? d.organization.chartViewUpdated
            : d.organization.chartViewCreated,
        );
      }}
    >
      <div className="chart-view-form-grid">
        <label>
          <span>{d.organization.chartViewNameLao}</span>
          <input
            value={draft.nameLo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                nameLo: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span>{d.organization.chartViewNameEnglish}</span>
          <input
            value={draft.nameEn}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                nameEn: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span>{d.organization.chartViewRoot}</span>
          <select
            disabled={view?.isDefault}
            value={draft.rootPositionId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                rootPositionId: event.target.value,
              }))
            }
          >
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {positionTitle(position, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{d.organization.chartViewParent}</span>
          <select
            disabled={view?.isDefault}
            value={draft.parentViewId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                parentViewId: event.target.value,
              }))
            }
          >
            <option value="">{d.organization.noParentView}</option>
            {orderedViews
              .filter((candidate) => candidate.id !== view?.id)
              .map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {chartViewName(candidate, locale)}
                </option>
              ))}
          </select>
        </label>
      </div>
      <label className="chart-view-active-control">
        <input
          type="checkbox"
          disabled={view?.isDefault}
          checked={draft.isActive}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              isActive: event.target.checked,
            }))
          }
        />
        <span>{d.organization.chartViewActive}</span>
      </label>
      {view?.isDefault ? (
        <p className="field-help">{d.organization.defaultViewProtected}</p>
      ) : null}
      <div className="chart-view-form-actions">
        <button className="button button-primary" type="submit">
          {d.organization.saveChartView}
        </button>
        <button className="button button-ghost" type="button" onClick={onCancel}>
          {d.organization.cancelChartView}
        </button>
      </div>
    </form>
  );
}

export function ChartViewAdmin({
  organization,
  data,
  selectedViewId,
  selectedPositionId,
  onSelectView,
  onSave,
  onMessage,
}: {
  organization: OrganizationData;
  data: ChartViewData;
  selectedViewId: string;
  selectedPositionId: string | null;
  onSelectView: (viewId: string) => void;
  onSave: (data: ChartViewData) => boolean;
  onMessage: (message: string) => void;
}) {
  const { locale, dictionary: d } = useI18n();
  const [creating, setCreating] = useState(false);
  const [creationSourceId, setCreationSourceId] = useState<string | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [positionQuery, setPositionQuery] = useState("");
  const views = orderedChartViews(data, true);
  const currentView =
    data.views.find((view) => view.id === selectedViewId) ??
    data.views.find((view) => view.isDefault)!;
  const memberships = positionIdsForView(data, currentView.id);
  const disconnected = disconnectedPositionsForView(
    organization,
    data,
    currentView,
  );
  const normalizedQuery = positionQuery.trim().toLocaleLowerCase(locale);
  const visiblePositions = useMemo(
    () =>
      sortedPositions(organization).filter((position) => {
        if (!normalizedQuery) return true;
        const person = assignedPerson(organization, position.id);
        const department =
          position.departmentTranslations?.[locale] ??
          position.department ??
          "";
        return `${positionTitle(position, locale)} ${person?.displayName ?? ""} ${department}`
          .toLocaleLowerCase(locale)
          .includes(normalizedQuery);
      }),
    [locale, normalizedQuery, organization],
  );
  const selectedPosition = selectedPositionId
    ? organization.positions.find(
        (position) => position.id === selectedPositionId,
      ) ?? null
    : null;
  const selectedLink = selectedPositionId
    ? data.links.find(
        (link) =>
          link.sourceViewId === currentView.id &&
          link.sourcePositionId === selectedPositionId,
      )
    : null;

  function commit(result: ChartViewResult, message: string) {
    if (!result.ok) {
      onMessage(errorMessage(result.error, d));
      return;
    }
    if (!onSave(result.data)) {
      onMessage(d.organization.storageError);
      return;
    }
    onMessage(message);
    if (result.viewId !== selectedViewId) onSelectView(result.viewId);
    setCreating(false);
    setCreationSourceId(null);
    setFormRevision((value) => value + 1);
  }

  function startCreating(sourcePositionId: string | null) {
    setCreationSourceId(sourcePositionId);
    setCreating(true);
    setFormRevision((value) => value + 1);
    onMessage("");
  }

  return (
    <section className="chart-view-admin" aria-labelledby="chart-view-admin-title">
      <div className="chart-view-admin-heading">
        <div>
          <span className="eyebrow">{d.organization.chartViews}</span>
          <h3 id="chart-view-admin-title">{d.organization.manageChartViews}</h3>
        </div>
        <button
          className="chart-view-add"
          type="button"
          onClick={() => startCreating(null)}
          aria-label={d.organization.createChartView}
          title={d.organization.createChartView}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
      <p className="chart-view-help">{d.organization.chartViewsHelp}</p>

      <label className="chart-view-selector">
        <span>{d.organization.chartView}</span>
        <select
          value={currentView.id}
          onChange={(event) => {
            setCreating(false);
            setCreationSourceId(null);
            onSelectView(event.target.value);
            onMessage("");
          }}
        >
          {views.map((view) => (
            <option key={view.id} value={view.id}>
              {chartViewName(view, locale)}{view.isActive ? "" : " · Off"}
            </option>
          ))}
        </select>
      </label>

      <div className="chart-view-order-actions">
        <button
          type="button"
          className="button button-ghost"
          disabled={views[0]?.id === currentView.id}
          onClick={() =>
            commit(
              moveChartView(data, organization, currentView.id, -1),
              d.organization.chartViewReordered,
            )
          }
        >
          <ChevronUp aria-hidden="true" />
          {d.organization.moveViewUp}
        </button>
        <button
          type="button"
          className="button button-ghost"
          disabled={views.at(-1)?.id === currentView.id}
          onClick={() =>
            commit(
              moveChartView(data, organization, currentView.id, 1),
              d.organization.chartViewReordered,
            )
          }
        >
          <ChevronDown aria-hidden="true" />
          {d.organization.moveViewDown}
        </button>
      </div>

      <details className="chart-view-settings" open={creating}>
        <summary>
          {creating
            ? d.organization.createChartView
            : d.organization.editChartView}
        </summary>
        <ChartViewForm
          key={`${creating ? "new" : currentView.id}-${formRevision}`}
          view={creating ? null : currentView}
          organization={organization}
          chartViews={data}
          parentViewId={currentView.id}
          sourcePositionId={creationSourceId}
          onCommit={commit}
          onCancel={() => {
            setCreating(false);
            setCreationSourceId(null);
            setFormRevision((value) => value + 1);
          }}
        />
        {!creating && !currentView.isDefault ? (
          <button
            className="button button-danger chart-view-delete"
            type="button"
            onClick={() => {
              if (!window.confirm(d.organization.confirmDeleteChartView)) return;
              commit(
                deleteChartView(data, organization, currentView.id),
                d.organization.chartViewDeleted,
              );
            }}
          >
            {d.organization.deleteChartView}
          </button>
        ) : null}
      </details>

      <details className="chart-view-settings">
        <summary>{d.organization.viewMembership}</summary>
        <p className="field-help">{d.organization.membershipHelp}</p>
        <input
          className="chart-view-position-search"
          type="search"
          value={positionQuery}
          placeholder={d.organization.findAnyPosition}
          onChange={(event) => setPositionQuery(event.target.value)}
        />
        <div className="chart-view-membership-list">
          {visiblePositions.length ? (
            visiblePositions.map((position) => {
              const person = assignedPerson(organization, position.id);
              const isRoot = position.id === currentView.rootPositionId;
              return (
                <label key={position.id}>
                  <input
                    type="checkbox"
                    checked={memberships.has(position.id)}
                    disabled={isRoot}
                    onChange={(event) =>
                      commit(
                        setChartViewMembership(
                          data,
                          organization,
                          currentView.id,
                          position.id,
                          event.target.checked,
                        ),
                        d.organization.membershipUpdated,
                      )
                    }
                  />
                  <span>
                    <strong>{positionTitle(position, locale)}</strong>
                    <small>{person?.displayName ?? d.organization.vacant}</small>
                  </span>
                </label>
              );
            })
          ) : (
            <p>{d.organization.noPositionsFound}</p>
          )}
        </div>
        {disconnected.length > 0 ? (
          <div className="chart-view-warning" role="status">
            <strong>{d.organization.disconnectedTitle}</strong>
            <p>
              {formatMessage(d.organization.disconnectedWarning, {
                count: disconnected.length,
              })}
            </p>
          </div>
        ) : null}
      </details>

      <details className="chart-view-settings" open={Boolean(selectedPosition)}>
        <summary>{d.organization.linkedView}</summary>
        {selectedPosition && memberships.has(selectedPosition.id) ? (
          <>
            <strong className="chart-view-selected-position">
              {positionTitle(selectedPosition, locale)}
            </strong>
            <label className="chart-view-link-select">
              <span>{d.organization.linkedView}</span>
              <select
                value={selectedLink?.targetViewId ?? ""}
                onChange={(event) =>
                  commit(
                    setChartViewLink(
                      data,
                      organization,
                      currentView.id,
                      selectedPosition.id,
                      event.target.value || null,
                    ),
                    d.organization.linkedViewUpdated,
                  )
                }
              >
                <option value="">{d.organization.noLinkedView}</option>
                {views
                  .filter((view) => view.id !== currentView.id)
                  .map((view) => (
                    <option key={view.id} value={view.id}>
                      {chartViewName(view, locale)}
                    </option>
                  ))}
              </select>
            </label>
            <p className="field-help">{d.organization.linkedViewHelp}</p>
            <button
              className="button button-secondary chart-view-create-linked"
              type="button"
              onClick={() => startCreating(selectedPosition.id)}
            >
              {d.organization.createLinkedChart}
            </button>
          </>
        ) : (
          <p className="field-help">{d.organization.selectedPositionRequired}</p>
        )}
      </details>
    </section>
  );
}
