"use client";

import { useEffect, useRef, useState } from "react";

import { LocationSelect as Select } from "@/components/shop/order/LocationSelect";
import type { LocationData, LocationSelection } from "@/lib/locations/types";

interface LocationPickerProps {
  value: LocationSelection;
  onChange: (value: LocationSelection) => void;
  errors: Record<string, string>;
}

const LOADING = "লোড হচ্ছে...";

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
  const placeholder = (text: string) => (data ? text : LOADING);

  return (
    <div ref={ref} className="space-y-4">
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
        {data?.divisions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.bn}
          </option>
        ))}
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
        <option value="">{placeholder(division ? "জেলা বেছে নিন" : "আগে বিভাগ বেছে নিন")}</option>
        {division?.districts.map((item) => (
          <option key={item.id} value={item.id}>
            {item.bn}
          </option>
        ))}
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
        <option value="">{placeholder(district ? "উপজেলা বা থানা বেছে নিন" : "আগে জেলা বেছে নিন")}</option>
        {district?.cityThanas && (
          <optgroup label={district.cityLabel}>
            {district.cityThanas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.bn}
              </option>
            ))}
          </optgroup>
        )}
        {district &&
          (district.cityThanas ? (
            <optgroup label="উপজেলা">
              {district.upazilas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.bn}
                </option>
              ))}
            </optgroup>
          ) : (
            district.upazilas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.bn}
              </option>
            ))
          ))}
      </Select>

      {failed && (
        <p role="alert" className="text-sm font-medium text-brand-dark">
          এলাকার তালিকা লোড হয়নি। পেজটি আবার লোড করুন।
        </p>
      )}
    </div>
  );
}
