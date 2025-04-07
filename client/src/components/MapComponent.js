// client/src/components/MapComponent.js
import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

const ClickableMap = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

const MapComponent = ({ onLocationSelect }) => {
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickableMap onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
};

export default MapComponent;
