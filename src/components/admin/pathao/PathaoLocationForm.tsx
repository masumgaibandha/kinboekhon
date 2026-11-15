"use client";

import { useState, useTransition, type FormEvent } from "react";

import { loadPathaoAreas, loadPathaoZones, savePathaoLocation } from "@/app/admin/(panel)/orders/pathao-actions";
import { PlaceSelect } from "@/components/admin/pathao/PlaceSelect";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import type { MatchSource } from "@/lib/pathao/location-match";
import type { PathaoPlace } from "@/lib/pathao/places";

const SOURCE_HINTS: Record<MatchSource, string> = {
  order: "Saved on this order.",
  remembered: "Remembered from an earlier correction.",
  auto: "Matched by name. Check it.",
  none: "Not matched. Pick it.",
};

interface PathaoLocationFormProps {
  orderNumber: string;
  cities: PathaoPlace[];
  zones: PathaoPlace[];
  areas: PathaoPlace[];
  initial: { cityId: string; zoneId: string; areaId: string };
  citySource: MatchSource;
  zoneSource: MatchSource;
}

// Pathao city, zone and optional area for this order. Saving also remembers the choice for later orders.
export function PathaoLocationForm({ orderNumber, cities, zones, areas, initial, citySource, zoneSource }: PathaoLocationFormProps) {
  const { submit, pending, errors } = useAdminAction("pathao-location");
  const [loading, startLoading] = useTransition();
  const [picked, setPicked] = useState(initial);
  const [lists, setLists] = useState({ zones, areas });

  function pickCity(cityId: string) {
    setPicked({ cityId, zoneId: "", areaId: "" });
    setLists({ zones: [], areas: [] });
    if (cityId) startLoading(async () => setLists({ zones: await loadPathaoZones(Number(cityId)), areas: [] }));
  }

  function pickZone(zoneId: string) {
    setPicked((current) => ({ ...current, zoneId, areaId: "" }));
    setLists((current) => ({ ...current, areas: [] }));
    if (zoneId) startLoading(async () => {
      const found = await loadPathaoAreas(Number(zoneId));
      setLists((current) => ({ ...current, areas: found }));
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(savePathaoLocation, new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <div className="grid gap-3 sm:grid-cols-3">
        <PlaceSelect
          name="cityId"
          label="City"
          value={picked.cityId}
          places={cities}
          placeholder="Pick a city"
          onChange={pickCity}
          error={errors.cityId}
          hint={picked.cityId === initial.cityId ? SOURCE_HINTS[citySource] : undefined}
        />
        <PlaceSelect
          name="zoneId"
          label="Zone"
          value={picked.zoneId}
          places={lists.zones}
          placeholder={loading && lists.zones.length === 0 ? "Loading..." : "Pick a zone"}
          onChange={pickZone}
          disabled={!picked.cityId}
          error={errors.zoneId}
          hint={picked.zoneId && picked.zoneId === initial.zoneId ? SOURCE_HINTS[zoneSource] : !picked.zoneId ? SOURCE_HINTS.none : undefined}
        />
        <PlaceSelect
          name="areaId"
          label="Area (optional)"
          value={picked.areaId}
          places={lists.areas}
          placeholder="Not set"
          onChange={(areaId) => setPicked((current) => ({ ...current, areaId }))}
          disabled={!picked.zoneId}
          error={errors.areaId}
        />
      </div>
      <button
        type="submit"
        disabled={pending || loading || !picked.cityId || !picked.zoneId}
        className="rounded-lg border border-line-strong bg-card px-4 py-2 text-sm font-semibold text-body hover:border-brand disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save location"}
      </button>
    </form>
  );
}
