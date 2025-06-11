require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import your models and routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const discountCodeRoutes = require('./routes/discountCodeRoutes'); // Import the new route

// Initialize the app
const app = express();

// =============================================
// Middleware Configuration
// =============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Force JSON responses
app.use(express.json()); // Ensures incoming JSON is parsed

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// Database Connection (with improved error handling)
// =============================================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// =============================================
// Route Configuration (Adding Discount Routes)
// =============================================
app.use('/api/auth', authRoutes);          // Authentication routes
app.use('/api/products', productRoutes);   // Product routes
app.use('/api/employees', employeeRoutes); // Employee routes
app.use('/api/discounts', discountCodeRoutes); // New Discount Code API

// =============================================
// Health Check Route
// =============================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// =============================================
// Improved Error Handling
// =============================================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('⚠️ Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =============================================
// Server Startup
// =============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 Available Routes:`);
  console.log(`   - Auth:      http://localhost:${PORT}/api/auth`);
  console.log(`   - Products:  http://localhost:${PORT}/api/products`);
  console.log(`   - Employees: http://localhost:${PORT}/api/employees`);
  console.log(`   - Discounts: http://localhost:${PORT}/api/discounts`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server and DB connections closed');
      process.exit(0);
    });
  });
});
