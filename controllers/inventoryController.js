const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const logAudit = require('../utils/auditLogger');

// @desc    Get Inventory Overview & Stock Calculations
// @route   GET /api/inventory
// @access  Private (Admin, Manager)
exports.getInventoryOverview = async (req, res, next) => {
  try {
    const products = await Product.find().populate('supplier', 'companyName');

    let totalProducts = products.length;
    let totalStockItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockValue = 0;

    const lowStockItems = [];
    const outOfStockItems = [];

    products.forEach((prod) => {
      totalStockItems += prod.quantity;
      totalStockValue += prod.quantity * prod.purchasePrice;

      if (prod.quantity === 0) {
        outOfStockCount++;
        outOfStockItems.push(prod);
      } else if (prod.quantity <= prod.minimumStock) {
        lowStockCount++;
        lowStockItems.push(prod);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalStockItems,
          totalStockValue,
          lowStockCount,
          outOfStockCount
        },
        lowStockItems,
        outOfStockItems,
        allProducts: products
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Adjust inventory stock manually
// @route   POST /api/inventory/adjust
// @access  Private (Admin, Manager)
exports.adjustInventory = async (req, res, next) => {
  try {
    const { productId, newQuantity, reason } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldQty = product.quantity;
    product.quantity = Math.max(0, parseInt(newQuantity, 10));
    await product.save();

    await logAudit({
      req,
      action: 'INVENTORY_ADJUST',
      module: 'INVENTORY',
      targetId: product._id,
      description: `Stock adjusted for ${product.productName} from ${oldQty} to ${product.quantity}. Reason: ${reason || 'Manual adjustment'}`
    });

    res.status(200).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};
