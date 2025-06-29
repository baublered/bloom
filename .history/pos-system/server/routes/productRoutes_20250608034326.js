const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Ensure this path is correct
const { addProduct, getAllProducts } = require('../controllers/productController');

// POST /api/products/add
router.post('/add', async (req, res) => {
  try {
    const { name, category, quantity, price, description } = req.body;

    // Validate required fields
    if (!name || !category || !quantity || !price || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Default image mapping based on flower name
    const flowerImages = {
      "Aster": "http://localhost:5000/uploads/aster.webp",
      "Astromenia": "http://localhost:5000/uploads/astromeria.webp",
      "Authurium": "http://localhost:5000/uploads/authurium.webp",
      "Baguio Rose": "http://localhost:5000/uploads/baguio_rose.webp",
      "Carnation": "http://localhost:5000/uploads/carnation.webp",
      "Daisy": "http://localhost:5000/uploads/daisy.webp",
      "Ecuadorian Roses": "http://localhost:5000/uploads/ecuadorian_roses.webp",
      "Eucalyptus China": "http://localhost:5000/uploads/eucalyptus_china.webp",
      "Gypsophilia": "http://localhost:5000/uploads/gypsophilia.webp",
      "Lisianthus": "http://localhost:5000/uploads/lisianthus.webp",
      "Malaysian Mumps": "http://localhost:5000/uploads/malaysian_mumps.webp",
      "Misty Blue": "http://localhost:5000/uploads/misty_blue.webp",
      "Radus": "http://localhost:5000/uploads/radus.webp",
      "Rose": "http://localhost:5000/uploads/rose.webp",
      "Stargazer": "http://localhost:5000/uploads/stargazer.webp",
      "Tulips": "http://localhost:5000/uploads/tulips.webp",
      // Add more flowers and images as needed
    };

    // Get the image URL based on the flower name or use a default image if no match is found
    const imageUrl = flowerImages[name] || 'http://localhost:5000/uploads/default.jpg'; // Default image if no match

    // Create the new product object
    const newProduct = new Product({
      name,
      category,
      quantity,
      price,
      description,
      image: imageUrl, // Store the image URL
    });

    // Save the new product to the database
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// NEW: POST /api/products/update (Update product quantity after sale)
router.post('/update', async (req, res) => {
  try {
    const { name, quantitySold } = req.body; // Get product name and quantity sold from request

    // Find the product by name
    const product = await Product.findOne({ name });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure there is enough stock
    if (product.quantity < quantitySold) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Deduct the quantity from the stock
    product.quantity -= quantitySold;
    await product.save();

    res.status(200).json({ message: 'Product quantity updated', product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

// NEW: GET /api/products
router.get('/', getAllProducts);

module.exports = router;
