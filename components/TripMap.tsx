"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, { Map as MlMap, Marker } from "maplibre-gl";
import type { Day, Place, TravelMode } from "./TripExperience";
import type { Leg } from "@/lib/routing";
import { Locate } from "lucide-react";

// Free vector style with dark theme (no API key required)
const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

type Props = {
  places: Place[];
  hiddenPlaces: Place[];
  rainyPlaces?: Place[]; // shown when the rainy panel is open
  day: Day | undefined;
  travelMode: TravelMode;
  legs: Leg[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  editMode?: boolean;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
};

// Stable hash of the marker-relevant data so we only rebuild markers when
// the *content* changes (not just on every render or transport mode flip).
function placesHash(places: Place[]): string {
  return places.map((p) => `${p.id}:${p.lat}:${p.lng}:${p.emoji}`).join("|");
}

export function TripMap({
  places,
  hiddenPlaces,
  rainyPlaces = [],
  day,
  travelMode,
  legs,
  selectedPlaceId,
  onSelectPlace,
  editMode,
  onMapClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const userLocMarkerRef = useRef<Marker | null>(null);

  // Stabilize the callback so effects don't depend on a fresh ref each render
  const onSelectRef = useRef(onSelectPlace);
  useEffect(() => {
    onSelectRef.current = onSelectPlace;
  }, [onSelectPlace]);

  // -----------------------------------------------------------
  // 1. Initialize map (once)
  // -----------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const container = containerRef.current;

    const map = new maplibregl.Map({
      container,
      style: DARK_STYLE,
      center: [19.0537, 47.4979],
      zoom: 12,
      pitch: 38,
      bearing: -10,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      try {
        map.resize();
      } catch {
        // ignore
      }
    });
    ro.observe(container);

    requestAnimationFrame(() => map.resize());
    map.once("load", () => {
      map.resize();
      // Register chevron icon once on load
      if (!map.hasImage("chevron")) {
        const size = 36;
        const cnv = document.createElement("canvas");
        cnv.width = size;
        cnv.height = size;
        const ctx = cnv.getContext("2d")!;
        ctx.clearRect(0, 0, size, size);
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath();
        ctx.moveTo(10, 7);
        ctx.lineTo(size - 7, size / 2);
        ctx.lineTo(10, size - 7);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        const img = ctx.getImageData(0, 0, size, size);
        map.addImage("chevron", img);
      }
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // -----------------------------------------------------------
  // 2. Markers — rebuild ONLY when day changes or places list changes
  //    (NOT on travelMode, NOT on selectedPlaceId)
  // -----------------------------------------------------------
  const markersHash = useMemo(
    () =>
      `${day?.id ?? "x"}::${placesHash(places)}::${placesHash(hiddenPlaces)}::${placesHash(rainyPlaces)}`,
    [day?.id, places, hiddenPlaces, rainyPlaces]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      const colorFrom = day?.colorFrom ?? "#f59e0b";
      const colorTo = day?.colorTo ?? "#ec4899";

      places.forEach((p, idx) => {
        const el = document.createElement("div");
        el.dataset.placeId = p.id;
        el.innerHTML = `
          <div class="map-marker" style="position:relative;width:42px;height:42px;color:${colorFrom};">
            <div class="map-marker-pulse" style="position:absolute;inset:0;border-radius:9999px;color:${colorFrom};display:none;"></div>
            <div class="map-marker-dot" style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9999px;color:white;font-weight:600;width:42px;height:42px;background:linear-gradient(135deg, ${colorFrom}, ${colorTo});box-shadow:0 8px 24px rgba(0,0,0,0.45);border:2px solid rgba(255,255,255,0.4);cursor:pointer;transition:transform 0.15s, border-color 0.15s;">
              <span style="font-size:18px;line-height:1;">${p.emoji}</span>
              <span style="font-size:9px;line-height:1;margin-top:2px;opacity:0.9;">${idx + 1}</span>
            </div>
          </div>
        `;
        el.addEventListener("click", () => onSelectRef.current(p.id));
        el.addEventListener("mouseenter", () => {
          const dot = el.querySelector(".map-marker-dot") as HTMLElement;
          if (dot) dot.style.transform = "scale(1.1)";
        });
        el.addEventListener("mouseleave", () => {
          const dot = el.querySelector(".map-marker-dot") as HTMLElement;
          if (dot) dot.style.transform = "";
        });
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        markersRef.current.set(p.id, marker);
      });

      hiddenPlaces.forEach((p) => {
        const el = document.createElement("div");
        el.dataset.placeId = p.id;
        el.innerHTML = `
          <div style="width:24px;height:24px;border-radius:9999px;background:rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;font-size:13px;border:1px dashed rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.15s;">
            ${p.emoji}
          </div>
        `;
        el.addEventListener("click", () => onSelectRef.current(p.id));
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        markersRef.current.set(p.id, marker);
      });

      // Rainy alternatives — diamond-shaped cyan markers (only visible when
      // the rainy panel is open). Distinct from regular round colored markers.
      rainyPlaces.forEach((p) => {
        const el = document.createElement("div");
        el.dataset.placeId = p.id;
        el.style.cursor = "pointer";
        el.innerHTML = `
          <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
            <div style="
              position:absolute;
              inset:0;
              transform:rotate(45deg);
              background:linear-gradient(135deg, rgba(125,211,252,0.95), rgba(56,189,248,0.95));
              border:2px solid rgba(255,255,255,0.7);
              box-shadow:0 8px 22px rgba(2,132,199,0.45);
              border-radius:6px;
              transition:transform 0.18s;
            "></div>
            <span style="position:relative;font-size:18px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));">${p.emoji}</span>
            <span style="position:absolute;top:-6px;right:-6px;background:#0ea5e9;color:white;border-radius:9999px;padding:2px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.85);font-size:10px;line-height:1;">💧</span>
          </div>
        `;
        el.addEventListener("click", () => onSelectRef.current(p.id));
        el.addEventListener("mouseenter", () => {
          const dia = el.firstElementChild?.firstElementChild as HTMLElement | null;
          if (dia) dia.style.transform = "rotate(45deg) scale(1.15)";
        });
        el.addEventListener("mouseleave", () => {
          const dia = el.firstElementChild?.firstElementChild as HTMLElement | null;
          if (dia) dia.style.transform = "rotate(45deg)";
        });
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        markersRef.current.set(p.id, marker);
      });

      // Fit bounds on the active day's places — extended to include rainy
      // alternatives if the panel is open (they may sit outside the day route).
      const bagdadiBounds: Array<{ lat: number; lng: number }> = [
        ...places,
        ...(rainyPlaces.length ? rainyPlaces : []),
      ];
      if (bagdadiBounds.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        bagdadiBounds.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 230, left: 60, right: 60 },
          duration: 900,
          maxZoom: 14.5,
        });
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markersHash]);

  // -----------------------------------------------------------
  // 3. Active-marker styling — toggle pulse + ring without rebuild
  // -----------------------------------------------------------
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const dot = el.querySelector(".map-marker-dot") as HTMLElement | null;
      const pulse = el.querySelector(".map-marker-pulse") as HTMLElement | null;
      const active = id === selectedPlaceId;
      if (dot) {
        dot.style.borderColor = active
          ? "rgba(255,255,255,0.95)"
          : "rgba(255,255,255,0.4)";
      }
      if (pulse) {
        pulse.style.display = active ? "block" : "none";
        pulse.classList.toggle("marker-pulse", active);
      }
    });
  }, [selectedPlaceId]);

  // -----------------------------------------------------------
  // 4. Route layers — rebuild only when leg geometry / mode / day color changes
  // -----------------------------------------------------------
  const lineGeoJSON = useMemo(() => {
    if (places.length < 2) return null;
    if (legs.length > 0) {
      const coords: [number, number][] = [];
      legs.forEach((l, i) => {
        if (i === 0) coords.push(...l.geometry);
        else coords.push(...l.geometry.slice(1));
      });
      return {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      };
    }
    return null;
  }, [places, legs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const sourceId = "day-route";
      const glowId = "day-route-glow";
      const haloId = "day-route-halo";
      const lineId = "day-route-line";
      const arrowId = "day-route-arrows";

      [arrowId, lineId, haloId, glowId].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (!lineGeoJSON) return;

      map.addSource(sourceId, { type: "geojson", data: lineGeoJSON });
      const lineColor = day?.colorFrom ?? "#f59e0b";
      const isTransit = travelMode === "transit";

      map.addLayer({
        id: glowId,
        type: "line",
        source: sourceId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": lineColor,
          "line-width": 22,
          "line-opacity": 0.22,
          "line-blur": 14,
        },
      });
      map.addLayer({
        id: haloId,
        type: "line",
        source: sourceId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": lineColor, "line-width": 12, "line-opacity": 0.55 },
      });
      map.addLayer({
        id: lineId,
        type: "line",
        source: sourceId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": isTransit ? 4 : 5,
          "line-opacity": 0.95,
          ...(isTransit ? { "line-dasharray": [1.4, 1.6] as never } : {}),
        },
      });
      map.addLayer({
        id: arrowId,
        type: "symbol",
        source: sourceId,
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 60,
          "icon-image": "chevron",
          "icon-size": ["interpolate", ["linear"], ["zoom"], 11, 0.55, 16, 1.0],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-pitch-alignment": "map",
        },
        paint: { "icon-opacity": 1 },
      });
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [lineGeoJSON, travelMode, day?.colorFrom]);

  // -----------------------------------------------------------
  // 5. Fly to selected place — no rebuild
  // -----------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;
    const all = [...places, ...hiddenPlaces];
    const p = all.find((x) => x.id === selectedPlaceId);
    if (!p) return;
    map.flyTo({
      center: [p.lng, p.lat],
      zoom: 15.5,
      pitch: 45,
      duration: 900,
      essential: true,
    });
  }, [selectedPlaceId, places, hiddenPlaces]);

  // -----------------------------------------------------------
  // 6. Click-to-add place when edit mode is on
  // -----------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: maplibregl.MapMouseEvent) => {
      if (onMapClick) onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    if (editMode && onMapClick) {
      map.getCanvas().style.cursor = "crosshair";
      map.on("click", handler);
    } else {
      map.getCanvas().style.cursor = "";
    }
    return () => {
      map.off("click", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [editMode, onMapClick]);

  function locate() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current!;
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        if (userLocMarkerRef.current) userLocMarkerRef.current.remove();
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="width:18px;height:18px;border-radius:9999px;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.25), 0 4px 18px rgba(0,0,0,0.4);"></div>
        `;
        userLocMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
        map.flyTo({ center: coords, zoom: 14, duration: 800 });
      },
      () => alert("Géolocalisation refusée ou indisponible")
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      <button
        onClick={locate}
        title="Ma position"
        className="absolute right-3 bottom-44 sm:bottom-40 z-10 panel-on-map-strong rounded-full p-3 hover:bg-white/15 transition"
      >
        <Locate className="h-4 w-4" />
      </button>
    </>
  );
}
