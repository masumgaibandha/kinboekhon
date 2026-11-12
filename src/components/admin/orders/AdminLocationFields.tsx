"use client";

import { useEffect, useState, type ReactNode } from "react";

import { CITY_CORPORATIONS } from "@/lib/locations/dhaka";
import type { LocationData, LocationSelection, Place } from "@/lib/locations/types";
import type { DeliveryArea } from "@/lib/orders/limits";

interface AdminLocationFieldsProps {
  area: DeliveryArea;
  cityCorporation: string;
  onCityCorporation: (value: string) => void;
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

const options = (places: Place[]) =>
  places.map((place) => (
    <option key={place.id} value={place.id}>
      {place.bn}
    </option>
  ));

// Same choices as the shop form: a city corporation inside Dhaka, or division, district and upazila outside.
export function AdminLocationFields(props: AdminLocationFieldsProps) {
  const { area, cityCorporation, onCityCorporation, selection, onSelection, errors } = props;
  const [data, setData] = useState<LocationData | null>(null);

  useEffect(() => {
    let active = true;
    import("@/data/bd-locations.json").then((module) => active && setData(module.default as LocationData));
    return () => {
      active = false;
    };
  }, []);

  if (area === "inside_dhaka") {
    return (
      <Select name="cityCorporation" label="City corporation" value={cityCorporation} error={errors.cityCorporation} onChange={onCityCorporation}>
        <option value="">Choose a city corporation</option>
        {CITY_CORPORATIONS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.bn} ({item.en})
          </option>
        ))}
      </Select>
    );
  }

  const division = data?.divisions.find((item) => item.id === selection.divisionId);
  const district = division?.districts.find((item) => item.id === selection.districtId);

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
        label="Upazila or thana"
        value={selection.upazilaId}
        error={errors.upazilaId}
        disabled={!district}
        onChange={(upazilaId) => onSelection({ ...selection, upazilaId })}
      >
        <option value="">Choose an upazila or thana</option>
        {district?.cityThanas && <optgroup label="City thanas">{options(district.cityThanas)}</optgroup>}
        {district && (district.cityThanas ? <optgroup label="Upazilas">{options(district.upazilas)}</optgroup> : options(district.upazilas))}
      </Select>
    </div>
  );
}
