// server/routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { spawn } = require('child_process');

// This endpoint expects query parameters lat and lon
router.get('/fetch-data', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    // 1. Fetch Elevation from Open-Elevation API
    const elevationResp = await axios.get('https://api.open-elevation.com/api/v1/lookup', {
      params: { locations: `${lat},${lon}` },
    });
    const elevation = elevationResp.data.results[0].elevation;
    console.log('Elevation:', elevation);

    // 2. Fetch weather data (Temperature, Humidity, Rainfall) from NASA POWER API
    const weatherResp = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
      params: {
        parameters: 'T2M,RH2M,PRECTOTCORR',  // RH (humidity) added back here
        community: 'RE',
        longitude: lon,
        latitude: lat,
        start: '20200101',
        end: '20200131',
        format: 'JSON',
      },
    });

    const weatherData = weatherResp.data.properties.parameter;
    const temperature = weatherData.T2M ? weatherData.T2M[Object.keys(weatherData.T2M)[0]] : null;
    const humidity = weatherData.RH ? weatherData.RH[Object.keys(weatherData.RH)[0]] : null;
    const rainfall = weatherData.PRECTOTCORR ? weatherData.PRECTOTCORR[Object.keys(weatherData.PRECTOTCORR)[0]] : null;
    console.log('Weather:', { temperature, humidity, rainfall });

    // 3. Fetch soil parameters from ISRIC SoilGrids API
    const soilURL = `https://rest.isric.org/soilgrids/v2.0/properties/query`;
    const soilResp = await axios.get(soilURL, {
      params: {
        lon,
        lat,
        depths: '0-5cm',
        properties: 'phh2o,soc,bdod,clay,sand,silt,cec,ocd,nitrogen,wv0010,wv0033,wv1500,cfvo,ocs',
      },
    });

    const layers = soilResp.data.properties.layers;
    const soilData = {};
    layers.forEach((layer) => {
      const propertyName = layer.name;
      if (layer.depths && layer.depths.length && layer.depths[0].values) {
        soilData[propertyName] = layer.depths[0].values.mean;
      } else {
        soilData[propertyName] = null;
      }
    });
    console.log('Soil data:', soilData);

    // Combine all fetched values
    const combinedData = {
      Latitude: lat,
      Longitude: lon,
      Elevation: elevation,
      Temperature: temperature,
      Humidity: humidity,
      Rainfall: rainfall,
      ...soilData,
    };

    // 4. Call Python script to predict N, P, K values.
    const pyProcess = spawn('python', [
      './python/predict.py',
      temperature,
      humidity,
      soilData.phh2o,
      rainfall,
    ]);

    let pyData = '';
    pyProcess.stdout.on('data', (data) => {
      pyData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    pyProcess.on('close', (code) => {
      let prediction = {};
      try {
        prediction = JSON.parse(pyData);
      } catch (e) {
        prediction = { error: 'Prediction error' };
      }
      return res.json({ data: combinedData, prediction });
    });
  } catch (error) {
    console.error('Error in /fetch-data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
