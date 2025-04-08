import React, { useState, useRef } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import DataDisplay from './components/DataDisplay';
import DownloadPDF from './components/DownloadPDF';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState('');

  const addressRef = useRef(null);
  const mapRef = useRef(null);

  const handleLocationSelect = async ({ lat, lng }) => {
    setSelectedPosition([lat, lng]);
    setIsLoading(true);

    try {
      const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
        },
      });
      const location = geoRes.data.display_name || 'Unknown location';
      setLocationName(location);

      if (addressRef.current) {
        addressRef.current.innerText = location;
      }

      const response = await axios.get(`http://localhost:5000/api/fetch-data`, {
        params: { lat, lon: lng },
      });

      setData(response.data.data);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937' }}>🌾 Soil Parameter Predictor</h1>

      <SearchBar onSearch={handleLocationSelect} />

      <div ref={mapRef} style={{ marginTop: '1rem', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
        <MapComponent
          onLocationSelect={handleLocationSelect}
          selectedPosition={selectedPosition}
          locationName={locationName}
        />
      </div>

      {/* Hidden Address for PDF only */}
      <div
        ref={addressRef}
        style={{ display: 'none' }}
      >
        {locationName}
      </div>

      {/* Loader */}
      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>🔄 Fetching data for your selected location...</p>
        </div>
      ) : (
        <>
          <DataDisplay data={data} prediction={prediction} />
          <DownloadPDF
            data={data}
            prediction={prediction}
            selectedPosition={selectedPosition}
            addressRef={addressRef}
            mapRef={mapRef}
          />
        </>
      )}
    </div>
  );
}

export default App;
