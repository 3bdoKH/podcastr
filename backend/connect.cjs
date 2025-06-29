require('dotenv').config({ path: 'config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const app = express();

app.use(cors());
app.use(bodyParser.json());
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000, 
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Connection string used:', process.env.ATLAS_URI ? 'Present' : 'Missing');
  process.exit(1);
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
app.use('/api', apiRoutes);
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ message: 'Internal server error' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));