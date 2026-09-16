const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private (Admin, Manager, Accountant)
exports.getPurchases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Purchase.countDocuments();
    const purchases = await Purchase.find()
      .populate('supplier', 'companyName supplierName email')
      .populate('items.product', 'productName SKU')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: purchases.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: purchases
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single purchase details
// @route   GET /api/purchases/:id
// @access  Private
exports.getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'companyName supplierName email phone address gstNumber')
      .populate('items.product', 'productName SKU category purchasePrice')
      .populate('createdBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (err) {
    next(err);
  }
};

// @desc    Create purchase order & auto update inventory
// @route   POST /api/purchases
// @access  Private (Admin, Manager, Accountant)
exports.createPurchase = async (req, res, next) => {
  try {
    const { supplier, items, tax = 0, discount = 0, notes = '' } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select a supplier and at least one product item'
      });
    }

    let subTotal = 0;
    const processedItems = [];

    // Calculate item totals & verify product existence
    for (const item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      const qty = parseInt(item.quantity, 10);
      const price = parseFloat(item.purchasePrice || productDoc.purchasePrice);
      const itemTotal = qty * price;
      subTotal += itemTotal;

      processedItems.push({
        product: productDoc._id,
        quantity: qty,
        purchasePrice: price,
        total: itemTotal
      });
    }

    const totalAmount = subTotal + parseFloat(tax) - parseFloat(discount);
    const purchaseNumber = `PO-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    const purchase = await Purchase.create({
      purchaseNumber,
      supplier,
      items: processedItems,
      subTotal,
      tax: parseFloat(tax),
      discount: parseFloat(discount),
      totalAmount,
      status: 'completed',
      notes,
      createdBy: req.user ? req.user._id : null
    });

    // Auto-update Product quantities (Stock Inventory Increase)
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    await logAudit({
      req,
      action: 'PURCHASE_CREATE',
      module: 'PURCHASE',
      targetId: purchase._id,
      description: `Created purchase order ${purchaseNumber} for total amount ₹${totalAmount}`
    });

    await Notification.create({
      recipientRole: 'manager',
      title: 'New Purchase Order',
      message: `Purchase order ${purchaseNumber} created for amount ₹${totalAmount.toFixed(2)}`,
      type: 'success',
      link: '/purchases'
    });

    res.status(201).json({
      success: true,
      message: 'Purchase created and inventory updated successfully',
      data: purchase
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel purchase order & revert inventory
// @route   PUT /api/purchases/:id/cancel
// @access  Private (Admin, Manager)
exports.cancelPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (purchase.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Purchase order is already cancelled' });
    }

    purchase.status = 'cancelled';
    await purchase.save();

    // Revert inventory quantity
    for (const item of purchase.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

    await logAudit({
      req,
      action: 'PURCHASE_CANCEL',
      module: 'PURCHASE',
      targetId: purchase._id,
      description: `Cancelled purchase order ${purchase.purchaseNumber} and reverted product stock`
    });

    res.status(200).json({
      success: true,
      message: 'Purchase order cancelled and inventory stock reverted',
      data: purchase
    });
  } catch (err) {
    next(err);
  }
};
