// server/server.js
const express = require('express');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', dataRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
