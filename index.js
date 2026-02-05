const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Import Routes
const contactRoutes = require('./routes/contactRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
    .then(() => console.log("MongoDB Connected successfully"))
    .catch(err => console.log("MongoDB connection error:", err));

// Routes
app.use('/api/contact', contactRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('QualityAuto Server is running');
});

// Conditionally start the server
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

// Export the app for Vercel
module.exports = app;
