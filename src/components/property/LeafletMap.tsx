"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from "react-leaflet";

export default function LeafletMap({ lat, lng, label, approximate }: { lat: number; lng: number; label: string; approximate?: boolean }) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      {approximate ? (
        <Circle center={[lat, lng]} radius={350} pathOptions={{ color: "#C5A46D", weight: 1, fillColor: "#C5A46D", fillOpacity: 0.12 }} />
      ) : null}
      <CircleMarker center={[lat, lng]} radius={9} pathOptions={{ color: "#F4F0E8", weight: 2, fillColor: "#C5A46D", fillOpacity: 1 }}>
        <Tooltip direction="top" offset={[0, -8]} permanent>
          {label}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
