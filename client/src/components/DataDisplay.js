// client/src/components/DataDisplay.js
import React from 'react';

const DataDisplay = ({ data, prediction }) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Fetched Data:</h3>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No data fetched yet.</p>
      )}
      {prediction && (
        <>
          <h3>Predicted N, P, K Values:</h3>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default DataDisplay;
