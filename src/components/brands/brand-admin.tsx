"use client";

import { useMemo, useState } from "react";
import {
  localizedBrandText,
  sortedBrands,
  sortedProducts,
} from "@/features/brands/model";
import { useBrandCatalog } from "@/features/brands/storage";
import type {
  Brand,
  BrandCatalog,
  BrandProduct,
  LocalizedBrandText,
} from "@/features/brands/types";
import { useI18n } from "@/i18n/provider";
import { BrandMedia } from "./brand-media";

const maximumImageBytes = 900_000;

function uniqueId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function textDraft(value?: LocalizedBrandText) {
  return { lo: value?.lo ?? "", en: value?.en ?? "" };
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/") || file.size > maximumImageBytes) {
      reject(new Error("invalid-image"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("invalid-image"));
    reader.onerror = () => reject(new Error("invalid-image"));
    reader.readAsDataURL(file);
  });
}

function ImageField({
  value,
  name,
  onChange,
  onError,
}: {
  value: string | null;
  name: string;
  onChange: (value: string | null) => void;
  onError: () => void;
}) {
  const { dictionary: d } = useI18n();
  const uploaded = value?.startsWith("data:image/") ?? false;
  return (
    <div className="brand-image-field">
      <BrandMedia
        imageUrl={value}
        name={name}
        sizes="96px"
        className="brand-image-preview"
      />
      <div className="brand-image-controls">
        <label>
          {d.brandAdmin.imageUrl}
          <input
            type="url"
            value={uploaded ? "" : (value ?? "")}
            placeholder={uploaded ? d.brandAdmin.uploadedImage : "https://"}
            onChange={(event) => onChange(event.target.value || null)}
          />
        </label>
        <label className="brand-file-control">
          <span>{d.brandAdmin.uploadImage}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = "";
              if (!file) return;
              try {
                onChange(await readImage(file));
              } catch {
                onError();
              }
            }}
          />
        </label>
        {value ? (
          <button
            className="text-button brand-remove-image"
            type="button"
            onClick={() => onChange(null)}
          >
            {d.brandAdmin.removeImage}
          </button>
        ) : null}
      </div>
    </div>
  );
}

type BrandDraft = {
  name: { lo: string; en: string };
  description: { lo: string; en: string };
  logoUrl: string | null;
  visible: boolean;
};

function BrandForm({
  brand,
  onSave,
  onCancel,
  onDelete,
  onImageError,
}: {
  brand: Brand | null;
  onSave: (draft: BrandDraft) => void;
  onCancel: () => void;
  onDelete: () => void;
  onImageError: () => void;
}) {
  const { dictionary: d } = useI18n();
  const [draft, setDraft] = useState<BrandDraft>({
    name: textDraft(brand?.name),
    description: textDraft(brand?.description),
    logoUrl: brand?.logoUrl ?? null,
    visible: brand?.visible ?? true,
  });

  return (
    <form
      className="brand-admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div className="brand-admin-language-grid">
        <label>
          {d.brandAdmin.nameLao}
          <input
            required
            value={draft.name.lo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: { ...current.name, lo: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.nameEnglish}
          <input
            required
            value={draft.name.en}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: { ...current.name, en: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.descriptionLao}
          <textarea
            rows={4}
            value={draft.description.lo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: {
                  ...current.description,
                  lo: event.target.value,
                },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.descriptionEnglish}
          <textarea
            rows={4}
            value={draft.description.en}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: {
                  ...current.description,
                  en: event.target.value,
                },
              }))
            }
          />
        </label>
      </div>
      <ImageField
        value={draft.logoUrl}
        name={draft.name.en || draft.name.lo || d.brandAdmin.newBrand}
        onChange={(logoUrl) => setDraft((current) => ({ ...current, logoUrl }))}
        onError={onImageError}
      />
      <label className="brand-visibility-control">
        <input
          type="checkbox"
          checked={draft.visible}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              visible: event.target.checked,
            }))
          }
        />
        <span>{d.brandAdmin.visibleOnWebsite}</span>
      </label>
      <div className="brand-admin-actions">
        <button className="button button-primary" type="submit">
          {brand ? d.brandAdmin.saveBrand : d.brandAdmin.createBrand}
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onCancel}
        >
          {d.brandAdmin.cancel}
        </button>
        {brand ? (
          <button
            className="brand-admin-danger"
            type="button"
            onClick={onDelete}
          >
            {d.brandAdmin.deleteBrand}
          </button>
        ) : null}
      </div>
    </form>
  );
}

type ProductDraft = {
  name: { lo: string; en: string };
  description: { lo: string; en: string };
  category: { lo: string; en: string };
  imageUrl: string | null;
  visible: boolean;
};

function ProductForm({
  product,
  onSave,
  onCancel,
  onDelete,
  onImageError,
}: {
  product: BrandProduct | null;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
  onDelete: () => void;
  onImageError: () => void;
}) {
  const { dictionary: d } = useI18n();
  const [draft, setDraft] = useState<ProductDraft>({
    name: textDraft(product?.name),
    description: textDraft(product?.description),
    category: textDraft(product?.category),
    imageUrl: product?.imageUrl ?? null,
    visible: product?.visible ?? true,
  });

  return (
    <form
      className="brand-admin-form brand-product-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div className="brand-admin-language-grid">
        <label>
          {d.brandAdmin.productNameLao}
          <input
            required
            value={draft.name.lo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: { ...current.name, lo: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.productNameEnglish}
          <input
            required
            value={draft.name.en}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: { ...current.name, en: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.categoryLao}
          <input
            value={draft.category.lo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: { ...current.category, lo: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.categoryEnglish}
          <input
            value={draft.category.en}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: { ...current.category, en: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.productDescriptionLao}
          <textarea
            rows={3}
            value={draft.description.lo}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: { ...current.description, lo: event.target.value },
              }))
            }
          />
        </label>
        <label>
          {d.brandAdmin.productDescriptionEnglish}
          <textarea
            rows={3}
            value={draft.description.en}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: { ...current.description, en: event.target.value },
              }))
            }
          />
        </label>
      </div>
      <ImageField
        value={draft.imageUrl}
        name={draft.name.en || draft.name.lo || d.brandAdmin.newProduct}
        onChange={(imageUrl) =>
          setDraft((current) => ({ ...current, imageUrl }))
        }
        onError={onImageError}
      />
      <label className="brand-visibility-control">
        <input
          type="checkbox"
          checked={draft.visible}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              visible: event.target.checked,
            }))
          }
        />
        <span>{d.brandAdmin.visibleOnWebsite}</span>
      </label>
      <div className="brand-admin-actions">
        <button className="button button-primary" type="submit">
          {product ? d.brandAdmin.saveProduct : d.brandAdmin.createProduct}
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onCancel}
        >
          {d.brandAdmin.cancel}
        </button>
        {product ? (
          <button
            className="brand-admin-danger"
            type="button"
            onClick={onDelete}
          >
            {d.brandAdmin.deleteProduct}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function BrandAdmin() {
  const { locale, dictionary: d } = useI18n();
  const { data, save } = useBrandCatalog();
  const brands = useMemo(() => sortedBrands(data), [data]);
  const [selectedId, setSelectedId] = useState<string | null>(
    brands[0]?.id ?? null,
  );
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");
  const selectedBrand = brands.find((brand) => brand.id === selectedId) ?? null;
  const products = selectedBrand ? sortedProducts(selectedBrand) : [];
  const editingProduct =
    products.find((product) => product.id === editingProductId) ?? null;

  function commit(next: BrandCatalog, successMessage: string) {
    if (!save(next)) {
      setMessage({ kind: "error", text: d.brandAdmin.storageError });
      return false;
    }
    setMessage({ kind: "success", text: successMessage });
    return true;
  }

  function replaceBrand(nextBrand: Brand, successMessage: string) {
    return commit(
      {
        ...data,
        brands: data.brands.map((brand) =>
          brand.id === nextBrand.id ? nextBrand : brand,
        ),
      },
      successMessage,
    );
  }

  const showBrandList = () => setMobileView("list");
  const showBrandEditor = () => setMobileView("editor");

  return (
    <div className="brand-admin-workspace">
      <div
        className="brand-admin-mobile-tabs"
        role="tablist"
        aria-label={d.brandAdmin.title}
      >
        <button
          className={mobileView === "list" ? "is-active" : undefined}
          type="button"
          role="tab"
          aria-selected={mobileView === "list"}
          onClick={showBrandList}
        >
          {d.brandAdmin.brands}
        </button>
        <button
          className={mobileView === "editor" ? "is-active" : undefined}
          type="button"
          role="tab"
          aria-selected={mobileView === "editor"}
          onClick={showBrandEditor}
        >
          {creatingBrand ? d.brandAdmin.newBrand : d.brandAdmin.editBrand}
        </button>
      </div>

      <aside
        className={`brand-admin-list-panel${
          mobileView === "editor" ? " is-mobile-hidden" : ""
        }`}
      >
        <header className="brand-admin-list-header">
          <div>
            <h1>{d.brandAdmin.brands}</h1>
            <p>
              {d.brandAdmin.brandCount.replace(
                "{count}",
                String(brands.length),
              )}
            </p>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setCreatingBrand(true);
              setSelectedId(null);
              setCreatingProduct(false);
              setEditingProductId(null);
              setMessage(null);
              showBrandEditor();
            }}
          >
            {d.brandAdmin.addBrand}
          </button>
        </header>

        <div className="brand-admin-list-scroll">
          <div className="brand-admin-list">
            {brands.map((brand) => {
              const name = localizedBrandText(brand.name, locale);
              return (
                <button
                  type="button"
                  key={brand.id}
                  className={selectedId === brand.id ? "is-selected" : ""}
                  onClick={() => {
                    setSelectedId(brand.id);
                    setCreatingBrand(false);
                    setCreatingProduct(false);
                    setEditingProductId(null);
                    setMessage(null);
                    showBrandEditor();
                  }}
                >
                  <BrandMedia
                    imageUrl={brand.logoUrl}
                    name={name}
                    sizes="48px"
                    className="brand-admin-list-logo"
                  />
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {brand.visible
                        ? d.brandAdmin.statusVisible
                        : d.brandAdmin.statusHidden}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section
        className={`brand-admin-editor-workspace${
          mobileView === "list" ? " is-mobile-hidden" : ""
        }`}
      >
        <div className="brand-admin-editor-scroll">
          <header className="brand-admin-workspace-heading">
            <span className="mode-label">{d.management.editMode}</span>
            <h1>
              {creatingBrand ? d.brandAdmin.newBrand : d.brandAdmin.editBrand}
            </h1>
            <p>{d.brandAdmin.translationHelp}</p>
            <p className="brand-admin-local-note">{d.brandAdmin.localOnly}</p>
          </header>

          {message ? (
            <p
              className={`org-form-message is-${message.kind}`}
              role={message.kind === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          ) : null}

          <section className="brand-admin-editor-panel">
            {creatingBrand || selectedBrand ? (
              <BrandForm
                key={
                  creatingBrand
                    ? "new-brand"
                    : `${selectedBrand?.id}:${data.contentRevision ?? 0}`
                }
                brand={creatingBrand ? null : selectedBrand}
                onImageError={() =>
                  setMessage({ kind: "error", text: d.brandAdmin.imageError })
                }
                onSave={(draft) => {
                  if (creatingBrand) {
                    const brand: Brand = {
                      id: uniqueId("brand"),
                      ...draft,
                      displayOrder:
                        Math.max(
                          -1,
                          ...data.brands.map((item) => item.displayOrder),
                        ) + 1,
                      products: [],
                    };
                    if (
                      commit(
                        { ...data, brands: [...data.brands, brand] },
                        d.brandAdmin.brandCreated,
                      )
                    ) {
                      setCreatingBrand(false);
                      setSelectedId(brand.id);
                    }
                    return;
                  }
                  if (!selectedBrand) return;
                  replaceBrand(
                    { ...selectedBrand, ...draft },
                    d.brandAdmin.brandSaved,
                  );
                }}
                onCancel={() => {
                  setCreatingBrand(false);
                  setSelectedId(brands[0]?.id ?? null);
                  setMessage(null);
                }}
                onDelete={() => {
                  if (
                    !selectedBrand ||
                    !window.confirm(d.brandAdmin.confirmDeleteBrand)
                  )
                    return;
                  if (
                    commit(
                      {
                        ...data,
                        brands: data.brands.filter(
                          (brand) => brand.id !== selectedBrand.id,
                        ),
                      },
                      d.brandAdmin.brandDeleted,
                    )
                  ) {
                    const remaining = brands.filter(
                      (brand) => brand.id !== selectedBrand.id,
                    );
                    setSelectedId(remaining[0]?.id ?? null);
                  }
                }}
              />
            ) : (
              <p className="brand-admin-empty">{d.brandAdmin.selectBrand}</p>
            )}
          </section>

          {selectedBrand && !creatingBrand ? (
            <section className="brand-admin-products-panel">
              <div className="brand-admin-panel-heading">
                <div>
                  <h2>{d.brandAdmin.products}</h2>
                  <p>
                    {d.brandAdmin.productCount.replace(
                      "{count}",
                      String(products.length),
                    )}
                  </p>
                </div>
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => {
                    setCreatingProduct(true);
                    setEditingProductId(null);
                    setMessage(null);
                  }}
                >
                  {d.brandAdmin.addProduct}
                </button>
              </div>
              {products.length ? (
                <div className="brand-admin-product-list">
                  {products.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      className={
                        editingProductId === product.id ? "is-selected" : ""
                      }
                      onClick={() => {
                        setCreatingProduct(false);
                        setEditingProductId(product.id);
                        setMessage(null);
                      }}
                    >
                      <BrandMedia
                        imageUrl={product.imageUrl}
                        name={localizedBrandText(product.name, locale)}
                        sizes="52px"
                        className="brand-admin-product-image"
                      />
                      <span>
                        <strong>
                          {localizedBrandText(product.name, locale)}
                        </strong>
                        <small>
                          {product.visible
                            ? d.brandAdmin.statusVisible
                            : d.brandAdmin.statusHidden}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="brand-admin-empty">{d.brandAdmin.noProducts}</p>
              )}
              {creatingProduct || editingProduct ? (
                <div className="brand-product-editor">
                  <h3>
                    {creatingProduct
                      ? d.brandAdmin.newProduct
                      : d.brandAdmin.editProduct}
                  </h3>
                  <ProductForm
                    key={
                      creatingProduct
                        ? "new-product"
                        : `${editingProduct?.id}:${data.contentRevision ?? 0}`
                    }
                    product={creatingProduct ? null : editingProduct}
                    onImageError={() =>
                      setMessage({
                        kind: "error",
                        text: d.brandAdmin.imageError,
                      })
                    }
                    onSave={(draft) => {
                      const nextProduct: BrandProduct = creatingProduct
                        ? {
                            id: uniqueId("product"),
                            ...draft,
                            displayOrder:
                              Math.max(
                                -1,
                                ...selectedBrand.products.map(
                                  (product) => product.displayOrder,
                                ),
                              ) + 1,
                          }
                        : { ...(editingProduct as BrandProduct), ...draft };
                      const nextProducts = creatingProduct
                        ? [...selectedBrand.products, nextProduct]
                        : selectedBrand.products.map((product) =>
                            product.id === nextProduct.id
                              ? nextProduct
                              : product,
                          );
                      if (
                        replaceBrand(
                          { ...selectedBrand, products: nextProducts },
                          creatingProduct
                            ? d.brandAdmin.productCreated
                            : d.brandAdmin.productSaved,
                        )
                      ) {
                        setCreatingProduct(false);
                        setEditingProductId(nextProduct.id);
                      }
                    }}
                    onCancel={() => {
                      setCreatingProduct(false);
                      setEditingProductId(null);
                      setMessage(null);
                    }}
                    onDelete={() => {
                      if (
                        !editingProduct ||
                        !window.confirm(d.brandAdmin.confirmDeleteProduct)
                      )
                        return;
                      if (
                        replaceBrand(
                          {
                            ...selectedBrand,
                            products: selectedBrand.products.filter(
                              (product) => product.id !== editingProduct.id,
                            ),
                          },
                          d.brandAdmin.productDeleted,
                        )
                      ) {
                        setEditingProductId(null);
                      }
                    }}
                  />
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
