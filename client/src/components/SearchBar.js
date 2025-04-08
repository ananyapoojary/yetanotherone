// client/src/components/SearchBar.js
import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [place, setPlace] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handlePlaceSearch = async (e) => {
    e.preventDefault();
    if (!place) return;

    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: place,
          format: 'json',
          limit: 1,
        },
      });

      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        onSearch({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert('Location not found.');
      }
    } catch (err) {
      console.error('Forward geocoding failed:', err);
    }
  };

  const handleLatLngSearch = (e) => {
    e.preventDefault();
    if (lat && lng) {
      onSearch({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Search by place name */}
      <form onSubmit={handlePlaceSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Search for a place (e.g., Mumbai)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          style={styles.inputWide}
        />
        <button type="submit" style={styles.button}>Search</button>
      </form>

      {/* OR search by lat/lng */}
      <form onSubmit={handleLatLngSearch} style={styles.form}>
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          required
          step="any"
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          required
          step="any"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Search by Lat/Lng</button>
      </form>
    </div>
  );
};

const styles = {
  form: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  input: {
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    width: '180px',
    background: '#f9fafb',
  },
  inputWide: {
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    width: '280px',
    background: '#f9fafb',
  },
  button: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default SearchBar;
