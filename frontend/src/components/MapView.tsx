import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom icons for different types
const createCustomIcon = (color: string, letter: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; font-size: 14px;">${letter}</div>`,
  className: 'custom-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const userIcon = createCustomIcon('#007bff', 'You');
const hospitalIcon = createCustomIcon('#dc3545', 'H');
const clinicIcon = createCustomIcon('#28a745', 'C');
const pharmacyIcon = createCustomIcon('#ffc107', 'P');

const getFacilityIcon = (type: string) => {
  switch (type) {
    case 'hospital':
      return hospitalIcon;
    case 'clinic':
      return clinicIcon;
    case 'pharmacy':
      return pharmacyIcon;
    default:
      return clinicIcon;
  }
};

interface FacilityMarker {
  id: string;
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
}

interface MapViewProps {
  center: { lat: number; lng: number };
  facilities: FacilityMarker[];
}

export function MapView({ center, facilities }: MapViewProps) {
  console.log("MapView rendering with center:", center, "facilities:", facilities);
  return (
    <div style={{ height: "400px", width: "100%", position: "relative" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>Your Location</Popup>
      </Marker>
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.coordinates.lat, facility.coordinates.lng]}
          icon={getFacilityIcon(facility.type)}
        >
          <Popup>{facility.name} ({facility.type})</Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
}
