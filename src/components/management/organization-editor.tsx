"use client";

import { useState } from "react";

import {
  assignedPerson,
  createPosition,
  deletePosition,
  descendantsOf,
  positionTitle,
  sortedPositions,
  updatePosition,
} from "@/features/organization/model";
import { useOrganizationData } from "@/features/organization/storage";
import {
  chartViewName,
  executiveChartViewId,
  removePositionFromChartViews,
  setChartViewMembership,
} from "@/features/chart-views/model";
import { useChartViewData } from "@/features/chart-views/storage";
import type {
  OrganizationData,
  OrganizationError,
} from "@/features/organization/types";
import { useI18n } from "@/i18n/provider";

import { OrganizationChart } from "./organization-chart";
import { OrganizationProfileCard } from "./organization-profile-card";
import { ChartViewAdmin } from "./chart-view-admin";

const maximumProfileImageBytes = 900_000;

type OrganizationTextKey = {
  [Key in keyof ReturnType<typeof useI18n>["dictionary"]["organization"]]:
    ReturnType<typeof useI18n>["dictionary"]["organization"][Key] extends string
      ? Key
      : never;
}[keyof ReturnType<typeof useI18n>["dictionary"]["organization"]] & string;
type OrganizationTextPath = `organization.${OrganizationTextKey}`;

function organizationText(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  path: OrganizationTextPath,
) {
  const key = path.slice("organization.".length) as OrganizationTextKey;
  return dictionary.organization[key] as string;
}

type PositionDraft = {
  title: string;
  parentId: string;
  department: string;
  personName: string;
  personImageUrl: string;
  biographyTranslations: {
    lo: string;
    en: string;
  };
};

function errorMessage(
  error: OrganizationError,
  t: (path: OrganizationTextPath) => string,
) {
  const messages: Record<OrganizationError, OrganizationTextPath> = {
    "title-required": "organization.errorTitleRequired",
    "parent-required": "organization.errorParentRequired",
    "position-not-found": "organization.errorPositionNotFound",
    "parent-not-found": "organization.errorParentNotFound",
    "self-parent": "organization.errorSelfParent",
    cycle: "organization.errorCycle",
    "root-parent": "organization.errorRootParent",
    "root-delete": "organization.errorRootDelete",
    "has-children": "organization.errorHasChildren",
    "invalid-data": "organization.errorInvalidData",
  };

  return t(messages[error]);
}

function readProfileImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (file.type !== "image/png" || file.size === 0) {
      reject(new Error("invalid"));
      return;
    }

    if (file.size > maximumProfileImageBytes) {
      reject(new Error("large"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("invalid"));
    };
    reader.onerror = () => reject(new Error("invalid"));
    reader.readAsDataURL(file);
  });
}

function createDraft(data: OrganizationData, positionId: string | null): PositionDraft {
  const position = positionId
    ? data.positions.find((item) => item.id === positionId)
    : null;
  const person = position ? assignedPerson(data, position.id) : null;

  return {
    title: position?.titleTranslations?.en ?? position?.title ?? "",
    parentId: position?.parentId ?? data.rootPositionId,
    department:
      position?.departmentTranslations?.en ?? position?.department ?? "",
    personName: person?.displayName ?? "",
    personImageUrl: person?.imageUrl ?? "",
    biographyTranslations: {
      lo: person?.biographyTranslations?.lo ?? "",
      en: person?.biographyTranslations?.en ?? "",
    },
  };
}

function PositionForm({
  data,
  positionId,
  onSubmit,
  onCancel,
  onDelete,
}: {
  data: OrganizationData;
  positionId: string | null;
  onSubmit: (draft: PositionDraft) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const { locale, dictionary } = useI18n();
  const t = (path: OrganizationTextPath) => organizationText(dictionary, path);
  const position = positionId
    ? data.positions.find((item) => item.id === positionId) ?? null
    : null;
  const currentPerson = position ? assignedPerson(data, position.id) : null;
  const isRoot = position?.id === data.rootPositionId;
  const [draft, setDraft] = useState(() => createDraft(data, positionId));
  const [photoError, setPhotoError] = useState("");
  const excludedParentIds = position
    ? new Set([position.id, ...descendantsOf(data, position.id)])
    : new Set<string>();
  const parentOptions = sortedPositions(data).filter(
    (item) => !excludedParentIds.has(item.id),
  );

  const updateDraft = <Key extends keyof PositionDraft>(
    key: Key,
    value: PositionDraft[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="org-position-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...draft,
          personImageUrl: isRoot
            ? currentPerson?.imageUrl ?? draft.personImageUrl
            : draft.personImageUrl,
        });
      }}
    >
      <fieldset className="org-form-section">
        <legend>{t("organization.positionSection")}</legend>
        <label>
          <span>{t("organization.titleLabel")}</span>
          <input
            disabled={isRoot}
            value={draft.title}
            onChange={(event) => updateDraft("title", event.target.value)}
            required
          />
        </label>
        <label>
          <span>{t("organization.parentLabel")}</span>
          <select
            disabled={isRoot}
            value={draft.parentId}
            onChange={(event) => updateDraft("parentId", event.target.value)}
            required={!isRoot}
          >
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {positionTitle(item, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t("organization.departmentLabel")}</span>
          <input
            value={draft.department}
            placeholder={t("organization.departmentPlaceholder")}
            onChange={(event) => updateDraft("department", event.target.value)}
          />
        </label>
        {isRoot ? <p className="field-help">{t("organization.rootLocked")}</p> : null}
      </fieldset>

      <fieldset className="org-form-section">
        <legend>{t("organization.personSection")}</legend>
        <label>
          <span>{t("organization.assignedPerson")}</span>
          <input
            value={draft.personName}
            onChange={(event) => updateDraft("personName", event.target.value)}
            placeholder={t("organization.personPlaceholder")}
          />
        </label>
        <p className="field-help">{t("organization.personHelp")}</p>

        <div className="org-photo-field">
          <span className="org-field-label">{t("organization.profilePhoto")}</span>
          <div className="org-photo-preview" aria-label={t("organization.profilePhoto")}>
            <OrganizationProfileCard
              positionId={position?.id ?? "position-preview"}
              positionTitle={draft.title || t("organization.titleLabel")}
              department={draft.department}
              personName={draft.personName}
              imageUrl={draft.personImageUrl || undefined}
              selected={false}
              matched={false}
              onSelect={() => undefined}
            />
          </div>
          {isRoot ? (
            <p className="field-help">{t("organization.rootPhotoLocked")}</p>
          ) : (
            <div className="org-photo-actions">
              <label className="button button-secondary org-file-button">
                {draft.personImageUrl
                  ? t("organization.replacePhoto")
                  : t("organization.uploadPhoto")}
                <input
                  type="file"
                  accept="image/png"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.currentTarget.value = "";
                    if (!file) return;
                    try {
                      const dataUrl = await readProfileImage(file);
                      updateDraft("personImageUrl", dataUrl);
                      setPhotoError("");
                    } catch {
                      setPhotoError(t("organization.photoError"));
                    }
                  }}
                />
              </label>
              {draft.personImageUrl ? (
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => {
                    updateDraft("personImageUrl", "");
                    setPhotoError("");
                  }}
                >
                  {t("organization.removePhoto")}
                </button>
              ) : null}
            </div>
          )}
          <p className="field-help">{t("organization.photoHelp")}</p>
          {photoError ? <p className="form-message is-error">{photoError}</p> : null}
        </div>
      </fieldset>

      <fieldset className="org-form-section">
        <legend>{t("organization.biographySection")}</legend>
        <label>
          <span>{t("organization.biographyLao")}</span>
          <textarea
            rows={8}
            value={draft.biographyTranslations.lo}
            placeholder={t("organization.biographyPlaceholder")}
            onChange={(event) =>
              updateDraft("biographyTranslations", {
                ...draft.biographyTranslations,
                lo: event.target.value,
              })
            }
          />
        </label>
        <label>
          <span>{t("organization.biographyEnglish")}</span>
          <textarea
            rows={8}
            value={draft.biographyTranslations.en}
            placeholder={t("organization.biographyPlaceholder")}
            onChange={(event) =>
              updateDraft("biographyTranslations", {
                ...draft.biographyTranslations,
                en: event.target.value,
              })
            }
          />
        </label>
      </fieldset>

      <div className="org-form-actions">
        <button className="button button-primary" type="submit">
          {position ? t("organization.saveChanges") : t("organization.saveCreate")}
        </button>
        <button className="button button-secondary" type="button" onClick={onCancel}>
          {t("organization.cancelEdit")}
        </button>
        {position && !isRoot ? (
          <button className="button button-danger" type="button" onClick={onDelete}>
            {t("organization.deletePosition")}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function OrganizationEditor() {
  const { locale, dictionary } = useI18n();
  const t = (path: OrganizationTextPath) => organizationText(dictionary, path);
  const { data, ready, save } = useOrganizationData();
  const {
    data: chartViewData,
    save: saveChartViewData,
  } = useChartViewData(data);
  const [selectedViewId, setSelectedViewId] = useState(executiveChartViewId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [message, setMessage] = useState("");
  const [mobileView, setMobileView] = useState<"editor" | "chart">("editor");

  if (!ready) {
    return <p className="org-admin-loading">{t("organization.loading")}</p>;
  }

  const selected = selectedId
    ? data.positions.find((position) => position.id === selectedId) ?? null
    : null;
  const selectedView =
    chartViewData.views.find((view) => view.id === selectedViewId) ??
    chartViewData.views.find((view) => view.isDefault)!;

  const startCreating = () => {
    setSelectedId(null);
    setFormRevision((value) => value + 1);
    setMessage("");
    setMobileView("editor");
  };

  const selectForEdit = (positionId: string) => {
    setSelectedId(positionId);
    setFormRevision((value) => value + 1);
    setMessage("");
    setMobileView("editor");
  };

  return (
    <div className="org-admin-workspace">
      <div className="org-admin-mobile-tabs" role="tablist" aria-label={t("organization.editTitle")}>
        <button
          className={mobileView === "editor" ? "is-active" : undefined}
          type="button"
          role="tab"
          aria-selected={mobileView === "editor"}
          onClick={() => setMobileView("editor")}
        >
          {t("organization.showEditor")}
        </button>
        <button
          className={mobileView === "chart" ? "is-active" : undefined}
          type="button"
          role="tab"
          aria-selected={mobileView === "chart"}
          onClick={() => setMobileView("chart")}
        >
          {t("organization.showChart")}
        </button>
      </div>

      <aside className={`org-admin-editor${mobileView === "chart" ? " is-mobile-hidden" : ""}`}>
        <ChartViewAdmin
          organization={data}
          data={chartViewData}
          selectedViewId={selectedView.id}
          selectedPositionId={selectedId}
          onSelectView={(viewId) => {
            setSelectedViewId(viewId);
            setSelectedId(null);
            setFormRevision((value) => value + 1);
          }}
          onSave={saveChartViewData}
          onMessage={setMessage}
        />
        <header className="org-editor-heading">
          <div>
            <span className="eyebrow">
              {selected ? t("organization.editModeTitle") : t("organization.createMode")}
            </span>
            <h2>
              {selected
                ? positionTitle(selected, locale)
                : t("organization.createNew")}
            </h2>
          </div>
          {selected ? (
            <button className="button button-ghost" type="button" onClick={startCreating}>
              {t("organization.createNew")}
            </button>
          ) : null}
        </header>

        {message ? <p className="form-message" role="status">{message}</p> : null}

        <PositionForm
          key={`${selectedId ?? "new"}-${formRevision}`}
          data={data}
          positionId={selectedId}
          onCancel={startCreating}
          onSubmit={(draft) => {
            const result = selectedId
              ? updatePosition(data, selectedId, {
                  ...draft,
                  parentId:
                    selectedId === data.rootPositionId ? null : draft.parentId,
                })
              : createPosition(data, draft);
            if (!result.ok) {
              setMessage(errorMessage(result.error, t));
              return;
            }
            if (!save(result.data)) {
              setMessage(t("organization.storageError"));
              return;
            }
            if (!selectedId) {
              const membershipResult = setChartViewMembership(
                chartViewData,
                result.data,
                selectedView.id,
                result.positionId,
                true,
              );
              if (
                !membershipResult.ok ||
                !saveChartViewData(membershipResult.data, result.data)
              ) {
                setMessage(t("organization.storageError"));
                return;
              }
            }
            setMessage(
              selectedId
                ? t("organization.updated")
                : t("organization.created"),
            );
            setSelectedId(result.positionId);
            setFormRevision((value) => value + 1);
          }}
          onDelete={() => {
            if (!selectedId) return;
            const current = data.positions.find((position) => position.id === selectedId);
            if (!current) return;
            if (
              chartViewData.views.some(
                (view) => view.rootPositionId === selectedId,
              )
            ) {
              setMessage(t("organization.positionIsChartRoot"));
              return;
            }
            if (!window.confirm(t("organization.confirmDelete"))) {
              return;
            }
            const result = deletePosition(data, selectedId);
            if (!result.ok) {
              setMessage(errorMessage(result.error, t));
              return;
            }
            const nextChartViews = removePositionFromChartViews(
              chartViewData,
              result.data,
              selectedId,
            );
            if (!nextChartViews) {
              setMessage(t("organization.positionIsChartRoot"));
              return;
            }
            if (
              !save(result.data) ||
              !saveChartViewData(nextChartViews, result.data)
            ) {
              setMessage(t("organization.storageError"));
              return;
            }
            setMessage(t("organization.deleted"));
            startCreating();
          }}
        />
      </aside>

      <section className={`org-admin-chart${mobileView === "editor" ? " is-mobile-hidden" : ""}`}>
        <header className="org-admin-chart-heading">
          <h1>{t("organization.editTitle")}</h1>
          <p>{t("organization.editDescription")}</p>
          <span className="org-admin-active-view">
            {chartViewName(selectedView, locale)}
          </span>
        </header>
        <OrganizationChart
          data={data}
          selectedId={selectedId}
          onSelect={selectForEdit}
          pannable
          chartView={selectedView}
          chartViewData={chartViewData}
          onOpenLinkedView={(view) => {
            setSelectedViewId(view.id);
            setSelectedId(null);
          }}
        />
      </section>
    </div>
  );
}
