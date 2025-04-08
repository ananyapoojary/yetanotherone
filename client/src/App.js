import React, { useState, useRef } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import DataDisplay from './components/DataDisplay';
import DownloadPDF from './components/DownloadPDF';

function App() {
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationName, setLocationName] = useState('');

  const addressRef = useRef(null); // for reverse geocoded address
  const mapRef = useRef(null);     // for capturing the map snapshot

  const handleLocationSelect = async ({ lat, lng }) => {
    setSelectedPosition([lat, lng]);

    try {
      // Fetch address using Nominatim
      const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
        },
      });

      setLocationName(geoRes.data.display_name || 'Unknown location');

      const response = await axios.get(`http://localhost:5000/api/fetch-data`, {
        params: { lat, lon: lng },
      });

      setData(response.data.data);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error fetching data or location name', error);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937' }}>🌾 Soil Parameter Predictor</h1>

      {/* Search bar */}
      <SearchBar onSearch={handleLocationSelect} />

      {/* Map & Address */}
      <div ref={mapRef} style={{ marginTop: '1rem', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
        <MapComponent
          onLocationSelect={handleLocationSelect}
          selectedPosition={selectedPosition}
          locationName={locationName}
          addressRef={addressRef}
        />
      </div>

      {/* Address below map */}
      <div
        ref={addressRef}
        style={{
          marginTop: '1rem',
          fontSize: '1.1rem',
          color: '#374151',
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        {locationName}
      </div>

      {/* Data display */}
      <DataDisplay data={data} prediction={prediction} />

      {/* Download as PDF */}
      <DownloadPDF
        data={data}
        prediction={prediction}
        selectedPosition={selectedPosition}
        addressRef={addressRef}
        mapRef={mapRef}
      />
    </div>
  );
}

export default App;
