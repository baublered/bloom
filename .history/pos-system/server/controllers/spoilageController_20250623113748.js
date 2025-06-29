const Product = require('../models/Product');
const SpoiledProduct = require('../models/SpoiledProduct');

// This function will find, move, and delete spoiled products
exports.processSpoilage = async (req, res) => {
  try {
    const today = new Date();
    
    // Find all products to check them
    const allProducts = await Product.find({});

    const spoiledProductsToMove = [];
    const productIdsToDelete = [];

    allProducts.forEach(product => {
      // Calculate the expiration date for each product
      const expirationDate = new Date(product.dateReceived);
      expirationDate.setDate(expirationDate.getDate() + product.lifespanInDays);

      // If the expiration date is in the past, it's spoiled
      if (expirationDate < today) {
        spoiledProductsToMove.push({
          originalProductId: product._id,
          productName: product.productName,
          productCategory: product.productCategory,
          quantitySpoiled: product.quantity,
          supplierName: product.supplierName,
          dateReceived: product.dateReceived,
          dateSpoiled: today,
        });
        productIdsToDelete.push(product._id);
      }
    });

    // If there are spoiled products to process
    if (spoiledProductsToMove.length > 0) {
      // 1. Add all spoiled products to the spoilage collection
      await SpoiledProduct.insertMany(spoiledProductsToMove);
      // 2. Delete the original products from the main inventory
      await Product.deleteMany({ _id: { $in: productIdsToDelete } });
    }

    res.status(200).json({
      success: true,
      message: `Processed ${spoiledProductsToMove.length} spoiled item(s).`,
      spoiledCount: spoiledProductsToMove.length,
    });

  } catch (error) {
    console.error("Error processing spoilage:", error);
    res.status(500).json({ message: 'Failed to process spoilage.' });
  }
};

// This function will fetch the data for the report
exports.getSpoilageReport = async (req, res) => {
    try {
        const spoiledProducts = await SpoiledProduct.find({}).sort({ dateSpoiled: -1 });
        res.status(200).json(spoiledProducts);
    } catch (error) {
        console.error("Error fetching spoilage report:", error);
        res.status(500).json({ message: 'Failed to fetch spoilage report.' });
    }
};
