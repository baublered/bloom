require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- CORRECTED IMPORTS ---
// We only need these three route files now.
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const discountCodeRoutes = require('./routes/discountCodeRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/transactions', require('./routes/transactionRoutes'));


// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});


// --- CORRECTED API ROUTES ---
// The employeeRoutes and userRoutes have been removed as they are now
// handled by authRoutes.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/discounts', discountCodeRoutes);


// 404 Handler and other middleware...
// ... (the rest of your file remains the same)


// Server Startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});
