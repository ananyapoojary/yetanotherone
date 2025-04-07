// client/src/components/DataDisplay.js
import React from 'react';

const DataDisplay = ({ data, prediction }) => {
  const renderDataSection = (title, obj) => (
    <div style={styles.section}>
      <h4 style={styles.sectionTitle}>{title}</h4>
      <div style={styles.grid}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} style={styles.card}>
            <div style={styles.cardKey}>{key.toUpperCase()}</div>
            <div style={styles.cardValue}>{value !== null ? value : 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>📊 Environmental & Soil Data</h3>

      {!data ? (
        <p style={styles.noDataText}>No data fetched yet.</p>
      ) : (
        renderDataSection('Fetched Data', data)
      )}

      {prediction && (
        <div style={{ ...styles.section, marginTop: '2rem' }}>
          <h4 style={styles.sectionTitle}>🌿 Predicted NPK Values</h4>
          {prediction.error ? (
            <p style={styles.error}>{prediction.error}</p>
          ) : (
            <div style={styles.grid}>
              {Object.entries(prediction).map(([key, value]) => (
                <div key={key} style={{ ...styles.card, background: '#d1fae5' }}>
                  <div style={{ ...styles.cardKey, color: '#065f46' }}>{key.toUpperCase()}</div>
                  <div style={{ ...styles.cardValue, fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {value.toFixed(2)}
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
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    maxWidth: '100%',
  },
  header: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.5rem',
  },
  noDataText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  section: {
    marginTop: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#374151',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: '#f3f4f6',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  cardKey: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  cardValue: {
    fontSize: '1rem',
    color: '#111827',
  },
  error: {
    color: '#dc2626',
    background: '#fee2e2',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: '500',
  },
};

export default DataDisplay;
