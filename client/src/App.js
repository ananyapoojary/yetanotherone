// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import DataDisplay from './components/DataDisplay';

function App() {
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleLocationSelect = async ({ lat, lng }) => {
    // Call your backend API endpoint with lat & lng
    try {
      const response = await axios.get(`http://localhost:5000/api/fetch-data`, {
        params: { lat, lon: lng },
      });
      setData(response.data.data);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Soil Parameter Predictor</h1>
      <SearchBar onSearch={handleLocationSelect} />
      <MapComponent onLocationSelect={handleLocationSelect} />
      <DataDisplay data={data} prediction={prediction} />
    </div>
  );
}

export default App;
