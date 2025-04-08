// client/src/components/MapComponent.js
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locmark from '../assets/soil-image.png';

const customIcon = new L.Icon({
  iconUrl: locmark,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'custom-marker',
});

const ClickableMap = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

const MapAutoFocus = ({ position }) => {
  const map = useMap();
  React.useEffect(() => {
    if (position) {
      map.setView(position, 7);
    }
  }, [position, map]);
  return null;
};

const MapComponent = ({ onLocationSelect, selectedPosition, locationName }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
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
      {locationName && (
        <p style={{ marginTop: '0.75rem', textAlign: 'center', fontStyle: 'italic', color: '#4b5563' }}>
          📍 <strong>Location:</strong> {locationName}
        </p>
      )}
    </div>
  );
};

export default MapComponent;
