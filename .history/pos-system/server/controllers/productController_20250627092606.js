const Product = require('../models/Product');

// ... (Your existing functions: getAllProducts, addProduct, updateStock, restockProducts)


// --- NEW FUNCTION to edit product details ---
const editProduct = async (req, res) => {
    try {
        const { id } = req.params; // Get the product ID from the URL

        // Get the updated data from the request body
        // We explicitly destructure the fields to ensure `quantity` is not included
        const {
            productName,
            productCategory,
            price,
            supplierName,
            lifespanInDays
        } = req.body;

        const updatedData = {
            productName,
            productCategory,
            price,
            supplierName,
            lifespanInDays
        };

        // Find the product by its ID and update it with the new data
        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Ensure the new data still meets schema requirements
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            product: updatedProduct,
        });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product details." });
    }
};


// --- Make sure to export the new function ---
module.exports = {
  getAllProducts,
  addProduct,
  updateStock,
  restockProducts,
  editProduct, // Add the new function here
};
