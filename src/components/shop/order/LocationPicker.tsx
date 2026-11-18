"use client";

import { useEffect, useRef, useState } from "react";

import { LocationSelect as Select } from "@/components/shop/order/LocationSelect";
import { useDesktop } from "@/components/shop/order/use-desktop";
import { CITY_CORPORATION_HINT, cityGroupOf } from "@/lib/locations/dhaka";
import type { LocationData, LocationSelection, Place } from "@/lib/locations/types";

interface LocationPickerProps {
  value: LocationSelection;
  onChange: (value: LocationSelection) => void;
  errors: Record<string, string>;
}

const LOADING = "লোড হচ্ছে...";

const options = (places: readonly Place[]) =>
  places.map((item) => (
    <option key={item.id} value={item.id}>
      {item.bn}
    </option>
  ));

export function LocationPicker({ value, onChange, errors }: LocationPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<LocationData | null>(null);
  const [failed, setFailed] = useState(false);

  // The list (about 10 KB compressed) loads only when the order form comes near the screen.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        import("@/data/bd-locations.json")
          .then((module) => active && setData(module.default as LocationData))
          .catch(() => active && setFailed(true));
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  const division = data?.divisions.find((item) => item.id === value.divisionId);
  const district = division?.districts.find((item) => item.id === value.districtId);
  // Dhaka lists its city corporations first, Chattogram its city thanas.
  const group = district ? cityGroupOf(district) : null;
  const groupLabel = group?.kind === "city_corporation" ? "সিটি কর্পোরেশন" : district?.cityLabel;
  const placeholder = (text: string) => (data ? text : LOADING);
  // From 1024px the three lists sit in one row, so their first lines stay short.
  const desktop = useDesktop();

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-3 lg:gap-3">
      <Select
        id="order-division"
        name="divisionId"
        label="বিভাগ"
        value={value.divisionId}
        error={errors.divisionId}
        disabled={!data}
        onChange={(divisionId) => onChange({ divisionId, districtId: "", upazilaId: "" })}
      >
        <option value="">{placeholder("বিভাগ বেছে নিন")}</option>
        {data && options(data.divisions)}
      </Select>

      <Select
        id="order-district"
        name="districtId"
        label="জেলা"
        value={value.districtId}
        error={errors.districtId}
        disabled={!division}
        onChange={(districtId) => onChange({ ...value, districtId, upazilaId: "" })}
      >
        <option value="">{placeholder(division || desktop ? "জেলা বেছে নিন" : "আগে বিভাগ বেছে নিন")}</option>
        {division && options(division.districts)}
      </Select>

      <Select
        id="order-upazila"
        name="upazilaId"
        label="উপজেলা / থানা"
        value={value.upazilaId}
        error={errors.upazilaId}
        disabled={!district}
        onChange={(upazilaId) => onChange({ ...value, upazilaId })}
      >
        <option value="">
          {placeholder(desktop ? "থানা বেছে নিন" : district ? "উপজেলা বা থানা বেছে নিন" : "আগে জেলা বেছে নিন")}
        </option>
        {group && <optgroup label={groupLabel}>{options(group.places)}</optgroup>}
        {district && (group ? <optgroup label="উপজেলা">{options(district.upazilas)}</optgroup> : options(district.upazilas))}
      </Select>

      {group?.kind === "city_corporation" && (
        <details className="text-sm text-desc lg:col-span-3">
          <summary className="w-fit font-medium text-brand-dark">ঢাকা সিটির এলাকা দেখুন</summary>
          <p className="mt-2 rounded-xl bg-page px-4 py-3 leading-relaxed">{CITY_CORPORATION_HINT}</p>
        </details>
      )}

      {failed && (
        <p role="alert" className="text-sm font-medium text-brand-dark lg:col-span-3">
          এলাকার তালিকা লোড হয়নি। পেজটি আবার লোড করুন।
        </p>
      )}
    </div>
  );
}
