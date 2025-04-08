// client/src/components/MapComponent.js
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locmark from '../assets/soil-image.png';

// Custom icon
const customIcon = new L.Icon({
  iconUrl: locmark,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'custom-marker',
});

// Component to handle map clicks
const ClickableMap = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

// Component to auto-zoom to marker
const MapAutoFocus = ({ position }) => {
  const map = useMap();
  React.useEffect(() => {
    if (position) {
      map.setView(position, 7); // 👈 Adjust zoom level here
    }
  }, [position, map]);
  return null;
};

const MapComponent = ({ onLocationSelect, selectedPosition }) => {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickableMap onLocationSelect={onLocationSelect} />
      {selectedPosition && (
        <>
          <Marker position={selectedPosition} icon={customIcon} />
          <MapAutoFocus position={selectedPosition} />
        </>
      )}
    </MapContainer>
  );
};

export default MapComponent;
