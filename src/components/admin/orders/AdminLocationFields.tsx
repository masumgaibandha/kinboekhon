"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cityGroupOf } from "@/lib/locations/dhaka";
import type { LocationData, LocationSelection, Place } from "@/lib/locations/types";

interface AdminLocationFieldsProps {
  selection: LocationSelection;
  onSelection: (value: LocationSelection) => void;
  errors: Record<string, string>;
}

interface SelectProps {
  name: string;
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}

function Select({ name, label, value, error, disabled, onChange, children }: SelectProps) {
  return (
    <div>
      <label htmlFor={`edit-${name}`} className="block text-sm font-medium text-body">
        {label}
      </label>
      <select
        id={`edit-${name}`}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={`mt-1 w-full rounded-lg border bg-card px-3 py-2 text-body outline-none focus:border-brand disabled:bg-page ${
          error ? "border-brand-dark" : "border-line-strong"
        }`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-brand-dark">{error}</p>}
    </div>
  );
}

const options = (places: readonly Place[]) =>
  places.map((place) => (
    <option key={place.id} value={place.id}>
      {place.bn}
    </option>
  ));

const GROUP_LABELS = { city_corporation: "City corporations", city_thana: "City thanas" } as const;

// Same choices as the shop form: division, district, then a city corporation (Dhaka), city thana or upazila.
export function AdminLocationFields({ selection, onSelection, errors }: AdminLocationFieldsProps) {
  const [data, setData] = useState<LocationData | null>(null);

  useEffect(() => {
    let active = true;
    import("@/data/bd-locations.json").then((module) => active && setData(module.default as LocationData));
    return () => {
      active = false;
    };
  }, []);

  const division = data?.divisions.find((item) => item.id === selection.divisionId);
  const district = division?.districts.find((item) => item.id === selection.districtId);
  const group = district ? cityGroupOf(district) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Select
        name="divisionId"
        label="Division"
        value={selection.divisionId}
        error={errors.divisionId}
        disabled={!data}
        onChange={(divisionId) => onSelection({ divisionId, districtId: "", upazilaId: "" })}
      >
        <option value="">{data ? "Choose a division" : "Loading..."}</option>
        {data && options(data.divisions)}
      </Select>
      <Select
        name="districtId"
        label="District"
        value={selection.districtId}
        error={errors.districtId}
        disabled={!division}
        onChange={(districtId) => onSelection({ ...selection, districtId, upazilaId: "" })}
      >
        <option value="">Choose a district</option>
        {division && options(division.districts)}
      </Select>
      <Select
        name="upazilaId"
        label="City corporation, upazila or thana"
        value={selection.upazilaId}
        error={errors.upazilaId}
        disabled={!district}
        onChange={(upazilaId) => onSelection({ ...selection, upazilaId })}
      >
        <option value="">Choose one</option>
        {group && <optgroup label={GROUP_LABELS[group.kind]}>{options(group.places)}</optgroup>}
        {district && (group ? <optgroup label="Upazilas">{options(district.upazilas)}</optgroup> : options(district.upazilas))}
      </Select>
    </div>
  );
}
