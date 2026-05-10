"use client";

import { useState, useMemo } from "react";
import { FilterSidebar, type GenderFilter, type PriceRange } from "@/components/filter-sidebar";
import { ProductCard } from "@/components/product-card";
import { ChevronDownIcon, CloseIcon } from "@/components/icons";
import type { Product, ShoeType, ShoeMaterial } from "@/types";
import { getSeller } from "@/data/sellers";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

const priceLabels: Record<string, string> = {
  "under-100": "Under 199 zł",
  "100-130": "199–399 zł",
  "over-130": "Over 399 zł",
};

const typeLabels: Record<string, string> = {
  runner: "Runner", walker: "Walker", "slip-on": "Slip-On", trainer: "Trainer",
  flat: "Flat", hiker: "Hiker", slide: "Slide", loafer: "Loafer", sock: "Sock",
  tee: "Tee", hoodie: "Hoodie", pant: "Jogger", jacket: "Jacket",
  cardigan: "Cardigan", bag: "Bag", beanie: "Beanie", cap: "Cap", insole: "Insole",
};

const materialLabels: Record<string, string> = {
  mesh: "Mesh", wool: "Wool", "tree-fiber": "Tree Fiber", knit: "Knit", leather: "Leather",
};

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1.5 pl-3 pr-2 py-1 text-[11px] font-medium bg-charcoal text-white rounded-full hover:bg-charcoal/80 transition-colors"
    >
      {label}
      <span className="text-white/70 text-[13px] leading-none">×</span>
    </button>
  );
}

interface ActiveFiltersBarProps {
  gender: GenderFilter;
  priceRange: PriceRange;
  shoeTypes: ShoeType[];
  materials: ShoeMaterial[];
  sizes: number[];
  sellerSlugs: string[];
  onGenderChange: (g: GenderFilter) => void;
  onPriceRangeChange: (r: PriceRange) => void;
  onShoeTypeChange: (types: ShoeType[]) => void;
  onMaterialChange: (mats: ShoeMaterial[]) => void;
  onSizesChange: (sizes: number[]) => void;
  onSellerChange: (slugs: string[]) => void;
  onClearAll: () => void;
}

function ActiveFiltersBar({
  gender, priceRange, shoeTypes, materials, sizes, sellerSlugs,
  onGenderChange, onPriceRangeChange, onShoeTypeChange, onMaterialChange,
  onSizesChange, onSellerChange, onClearAll,
}: ActiveFiltersBarProps) {
  const hasAny =
    gender !== "all" || priceRange !== "all" ||
    shoeTypes.length > 0 || materials.length > 0 ||
    sizes.length > 0 || sellerSlugs.length > 0;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {gender !== "all" && (
        <FilterTag
          label={gender === "men" ? "Men" : "Women"}
          onRemove={() => onGenderChange("all")}
        />
      )}
      {priceRange !== "all" && (
        <FilterTag
          label={priceLabels[priceRange]}
          onRemove={() => onPriceRangeChange("all")}
        />
      )}
      {shoeTypes.map((t) => (
        <FilterTag
          key={t}
          label={typeLabels[t] ?? t}
          onRemove={() => onShoeTypeChange(shoeTypes.filter((x) => x !== t))}
        />
      ))}
      {materials.map((m) => (
        <FilterTag
          key={m}
          label={materialLabels[m] ?? m}
          onRemove={() => onMaterialChange(materials.filter((x) => x !== m))}
        />
      ))}
      {sizes.map((s) => (
        <FilterTag
          key={s}
          label={`Size ${s}`}
          onRemove={() => onSizesChange(sizes.filter((x) => x !== s))}
        />
      ))}
      {sellerSlugs.map((slug) => {
        const seller = getSeller(slug);
        return seller ? (
          <FilterTag
            key={slug}
            label={seller.name}
            onRemove={() => onSellerChange(sellerSlugs.filter((x) => x !== slug))}
          />
        ) : null;
      })}
      <button
        onClick={onClearAll}
        className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

const sortLabels: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
};

interface CollectionViewProps {
  products: Product[];
  collectionName: string;
  initialSellerSlug?: string;
}

export function CollectionView({ products, collectionName, initialSellerSlug }: CollectionViewProps) {
  const [gender, setGender] = useState<GenderFilter>("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [shoeTypes, setShoeTypes] = useState<ShoeType[]>([]);
  const [materials, setMaterials] = useState<ShoeMaterial[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [sellerSlugs, setSellerSlugs] = useState<string[]>(
    initialSellerSlug ? [initialSellerSlug] : []
  );
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = products;

    if (gender !== "all") {
      result = result.filter((p) => p.category === gender || p.category === "unisex");
    }
    if (priceRange === "under-100") {
      result = result.filter((p) => p.price < 199);
    } else if (priceRange === "100-130") {
      result = result.filter((p) => p.price >= 199 && p.price <= 399);
    } else if (priceRange === "over-130") {
      result = result.filter((p) => p.price > 399);
    }
    if (shoeTypes.length > 0) {
      result = result.filter((p) => shoeTypes.includes(p.type));
    }
    if (materials.length > 0) {
      result = result.filter((p) => materials.includes(p.material));
    }
    if (sizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    }
    if (sellerSlugs.length > 0) {
      const sellerIds = sellerSlugs
        .map((slug) => getSeller(slug))
        .filter(Boolean)
        .map((s) => s!.id);
      result = result.filter((p) => sellerIds.includes(p.sellerId));
    }

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = [...result].sort((a, b) => {
          const aNew = a.badge === "new" || a.badge === "new-color" ? 1 : 0;
          const bNew = b.badge === "new" || b.badge === "new-color" ? 1 : 0;
          return bNew - aNew;
        });
        break;
    }

    return result;
  }, [products, gender, sort, priceRange, shoeTypes, materials, sizes, sellerSlugs]);

  const activeFilterCount =
    (gender !== "all" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (shoeTypes.length > 0 ? 1 : 0) +
    (materials.length > 0 ? 1 : 0) +
    (sizes.length > 0 ? 1 : 0) +
    (sellerSlugs.length > 0 ? 1 : 0);

  function clearAll() {
    setGender("all");
    setPriceRange("all");
    setShoeTypes([]);
    setMaterials([]);
    setSizes([]);
    setSellerSlugs([]);
  }

  const availableTypes = useMemo(() => {
    const types = new Set(products.map((p) => p.type));
    return Array.from(types);
  }, [products]);

  const sidebarProps = {
    gender,
    priceRange,
    shoeTypes,
    materials,
    sizes,
    availableTypes,
    sellerSlugs,
    onGenderChange: setGender,
    onPriceRangeChange: setPriceRange,
    onShoeTypeChange: setShoeTypes,
    onMaterialChange: setMaterials,
    onSizesChange: setSizes,
    onSellerChange: setSellerSlugs,
    onClearAll: clearAll,
    activeFilterCount,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.5px] border border-black/15 px-4 py-2.5 rounded hover:border-charcoal transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <line x1="1" y1="4" x2="15" y2="4" />
            <line x1="1" y1="8" x2="10" y2="8" />
            <line x1="1" y1="12" x2="6" y2="12" />
          </svg>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-full max-w-xs bg-white z-50 overflow-y-auto p-5 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-medium uppercase tracking-[0.5px]">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <CloseIcon />
              </button>
            </div>
            <FilterSidebar {...sidebarProps} />
          </div>
        </>
      )}

      <div className="flex gap-10">
        {/* Desktop sidebar — sticky */}
        <div className="hidden lg:block w-[220px] flex-shrink-0">
          <div className="sticky top-[93px] max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide">
            <FilterSidebar {...sidebarProps} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10">
            <div>
              <h2 className="text-2xl font-light text-charcoal">{collectionName}</h2>
              <p className="text-[12px] text-warm-gray mt-0.5">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.5px] text-charcoal hover:opacity-60 transition-opacity"
              >
                {sortLabels[sort]}
                <ChevronDownIcon className="h-3 w-3" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-black/10 shadow-lg rounded z-30 min-w-[180px]">
                  {(Object.keys(sortLabels) as SortOption[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-[12px] tracking-wide transition-colors ${
                        sort === s
                          ? "bg-cream font-medium text-charcoal"
                          : "text-warm-gray hover:bg-cream-light hover:text-charcoal"
                      }`}
                    >
                      {sortLabels[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filters bar */}
          <ActiveFiltersBar
            gender={gender}
            priceRange={priceRange}
            shoeTypes={shoeTypes}
            materials={materials}
            sizes={sizes}
            sellerSlugs={sellerSlugs}
            onGenderChange={setGender}
            onPriceRangeChange={setPriceRange}
            onShoeTypeChange={setShoeTypes}
            onMaterialChange={setMaterials}
            onSizesChange={setSizes}
            onSellerChange={setSellerSlugs}
            onClearAll={clearAll}
          />

          {/* Seller header strip */}
          {sellerSlugs.length === 1 && (() => {
            const activeSeller = getSeller(sellerSlugs[0]);
            if (!activeSeller) return null;
            const sellerProductCount = products.filter((p) => p.sellerId === activeSeller.id).length;
            return (
              <div className="mb-6 p-4 bg-cream-light rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-charcoal">{activeSeller.name}</h3>
                  <p className="text-[11px] text-warm-gray mt-0.5">
                    {sellerProductCount} products · Joined {activeSeller.joinedYear}
                    {activeSeller.rating > 0 && ` · ${activeSeller.rating} rating`}
                  </p>
                </div>
                <button
                  onClick={() => setSellerSlugs([])}
                  className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors"
                >
                  View all sellers
                </button>
              </div>
            );
          })()}

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-warm-gray text-sm mb-4">No products match your filters.</p>
              <button onClick={clearAll} className="btn-cta-outline text-[11px]">
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
