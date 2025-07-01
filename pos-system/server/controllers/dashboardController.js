const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const SpoiledProduct = require('../models/SpoiledProduct');

// Get dashboard summary data
exports.getDashboardSummary = async (req, res) => {
  try {
    // Parallel execution of all queries for better performance
    const [
      allProducts,
      allTransactions,
      spoiledProducts,
      // Get transactions from today for recent sales
      todayTransactions
    ] = await Promise.all([
      Product.find({}),
      Transaction.find({}),
      SpoiledProduct.find({}),
      Transaction.find({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          $lte: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
        }
      })
    ]);

    // Calculate inventory metrics
    const totalQuantityInHand = allProducts.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockItems = allProducts.filter(product => product.quantity <= 10).length; // Consider <= 10 as low stock
    const totalItems = allProducts.length;

    // Calculate sales metrics
    const totalSales = allTransactions.length;
    const totalRevenue = allTransactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
    
    // Today's sales
    const todaySales = todayTransactions.length;
    const todayRevenue = todayTransactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);

    // Spoilage metrics
    const totalSpoiledProducts = spoiledProducts.length;
    const totalSpoiledQuantity = spoiledProducts.reduce((sum, product) => sum + product.quantitySpoiled, 0);

    // Check for products nearing expiration (within 3 days)
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const nearExpiryProducts = allProducts.filter(product => {
      const expirationDate = new Date(product.dateReceived);
      expirationDate.setDate(expirationDate.getDate() + product.lifespanInDays);
      return expirationDate <= threeDaysFromNow && expirationDate > today;
    }).length;

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('transactionType totalAmount paymentMethod createdAt items');

    // Top selling products (based on transaction history)
    const productSales = {};
    allTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const productId = item.productId || item._id;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              productName: item.productName,
              totalSold: 0,
              revenue: 0
            };
          }
          productSales[productId].totalSold += item.quantity;
          productSales[productId].revenue += (item.price * item.quantity);
        }
      });
    });

    const topSellingProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map(([productId, data]) => ({
        productId,
        ...data
      }));

    const dashboardData = {
      // Sales Overview
      sales: {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        todaySales,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        averageOrderValue: totalSales > 0 ? Math.round((totalRevenue / totalSales) * 100) / 100 : 0
      },

      // Inventory Summary
      inventory: {
        totalQuantityInHand,
        totalItems,
        lowStockItems,
        nearExpiryProducts,
        inventoryValue: allProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0)
      },

      // Product Details
      products: {
        totalProducts: totalItems,
        lowStockItems,
        spoiledProducts: totalSpoiledProducts,
        spoiledQuantity: totalSpoiledQuantity,
        nearExpiryProducts
      },

      // Additional Insights
      insights: {
        topSellingProducts,
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction._id,
          type: transaction.transactionType,
          amount: transaction.totalAmount,
          method: transaction.paymentMethod,
          date: transaction.createdAt,
          itemCount: transaction.items.length
        }))
      },

      // Last updated timestamp
      lastUpdated: new Date()
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};
