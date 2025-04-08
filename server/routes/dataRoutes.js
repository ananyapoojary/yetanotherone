const express = require('express');
const router = express.Router();
const axios = require('axios');
const { spawn } = require('child_process');

router.get('/fetch-data', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    // 1. Fetch Elevation
    const elevationResp = await axios.get('https://api.open-elevation.com/api/v1/lookup', {
      params: { locations: `${lat},${lon}` },
    });
    const elevation = elevationResp.data.results[0].elevation;
    console.log('Elevation:', elevation);

    // 2. Fetch Temperature and Rainfall (DAILY)
    // 2. Fetch Temperature, Rainfall, and Humidity (DAILY)
const weatherDailyResp = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
    params: {
      parameters: 'T2M,PRECTOTCORR,RH2M',
      community: 'RE',
      longitude: lon,
      latitude: lat,
      start: '20200101',
      end: '20200131',
      format: 'JSON',
    },
  });
  
  const weatherDaily = weatherDailyResp.data.properties.parameter;
  const temperature = weatherDaily.T2M ? weatherDaily.T2M[Object.keys(weatherDaily.T2M)[0]] : null;
  const rainfall = weatherDaily.PRECTOTCORR ? weatherDaily.PRECTOTCORR[Object.keys(weatherDaily.PRECTOTCORR)[0]] : null;
  const humidity = weatherDaily.RH2M ? weatherDaily.RH2M[Object.keys(weatherDaily.RH2M)[0]] : null;
  

    

    console.log('Weather:', { temperature, humidity, rainfall });

    // 4. Fetch Soil Data
    const soilResp = await axios.get('https://rest.isric.org/soilgrids/v2.0/properties/query', {
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

    // Combine all data
    const combinedData = {
      latitude: lat,
      longitude: lon,
      elevation,
      temperature,
      humidity,
      rainfall,
      ...soilData,
    };
    

    // 5. Call Python prediction script
    const pyProcess = spawn('python3', [ // Use 'python3' instead of 'python' to avoid ENOENT
      './predict.py',
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

    // Handle Python spawn errors
    pyProcess.on('error', (err) => {
      console.error('Failed to start Python script:', err);
      res.status(500).json({ error: 'Python execution error' });
    });

  } catch (error) {
    console.error('Error in /fetch-data:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
