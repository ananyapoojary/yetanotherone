import React from 'react';

const soilMetadata = {
  bdod: { name: 'Bulk Density', unit: 'kg/dm³', factor: 0.01 },
  cec: { name: 'Cation Exchange Capacity', unit: 'cmol(c)/kg', factor: 0.1 },
  cfvo: { name: 'Coarse Fragments Volume', unit: 'vol%', factor: 0.1 },
  clay: { name: 'Clay Content', unit: '%', factor: 0.1 },
  nitrogen: { name: 'Total Nitrogen', unit: 'g/kg', factor: 0.01 },
  phh2o: { name: 'pH (H₂O)', unit: '', factor: 0.1 },
  sand: { name: 'Sand Content', unit: '%', factor: 0.1 },
  silt: { name: 'Silt Content', unit: '%', factor: 0.1 },
  soc: { name: 'Organic Carbon', unit: 'g/kg', factor: 0.1 },
  ocd: { name: 'Organic Carbon Density', unit: 'kg/m³', factor: 0.1 },
  ocs: { name: 'Organic Carbon Stock', unit: 'kg/m²', factor: 0.1 },
  wv0010: { name: 'Water @ 0.01 bar', unit: 'cm³/cm³', factor: 0.001 },
  wv0033: { name: 'Water @ 0.33 bar', unit: 'cm³/cm³', factor: 0.001 },
  wv1500: { name: 'Water @ 15 bar', unit: 'cm³/cm³', factor: 0.001 },
  humidity: { name: 'Relative Humidity @ 2m', unit: '%', factor: 1 },
  temperature: { name: 'Temperature @ 2m', unit: '°C', factor: 1 },
  rainfall: { name: 'Rainfall', unit: 'mm', factor: 1 },
  elevation: { name: 'Elevation', unit: 'm', factor: 1 },
};

const DataDisplay = ({ data, prediction }) => {
  const renderDataSection = (title, obj, metadata = null) => {
    return (
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>{title}</h4>
        <div style={styles.grid}>
          {Object.entries(obj).map(([key, value]) => {
            const meta = metadata?.[key];
            const label = meta?.name || key.toUpperCase();
            const unit = meta?.unit || '';
            const factor = meta?.factor || 1;
            const displayValue = value != null ? (value * factor).toFixed(2) : 'N/A';

            return (
              <div key={key} style={styles.card}>
                <div style={styles.cardLabel}>{label}</div>
                <div style={styles.cardValue}>
                  {displayValue}
                  {unit && <span style={styles.unitText}> {unit}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>📊 Environmental & Soil Data</h3>

      {!data ? (
        <p style={styles.noData}>No data fetched yet.</p>
      ) : (
        renderDataSection('Fetched Data', data, soilMetadata)
      )}

      {prediction && (
        <div style={{ ...styles.section, marginTop: '2.5rem' }}>
          <h4 style={styles.sectionTitle}>🌿 Predicted NPK Values</h4>
          {prediction.error ? (
            <p style={styles.error}>{prediction.error}</p>
          ) : (
            <div style={styles.grid}>
              {Object.entries(prediction).map(([key, value]) => (
                <div key={key} style={{ ...styles.card, backgroundColor: '#ecfdf5' }}>
                  <div style={{ ...styles.cardLabel, color: '#047857' }}>{key.toUpperCase()}</div>
                  <div style={{ ...styles.cardValue, fontWeight: '600', fontSize: '1.2rem' }}>
                    {value.toFixed(2)}
                    <span style={{ ...styles.unitText, fontWeight: '500' }}> ratio</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    marginTop: '2rem',
  },
  header: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0.75rem',
  },
  section: {
    marginTop: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: '#f9fafb',
    borderRadius: '10px',
    padding: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardLabel: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '0.4rem',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: '1.1rem',
    color: '#111827',
  },
  unitText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginLeft: '4px',
  },
  noData: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: '500',
  },
};

export default DataDisplay;
