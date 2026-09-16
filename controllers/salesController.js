const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Admin, Manager, Accountant)
exports.getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Sale.countDocuments();
    const sales = await Sale.find()
      .populate('customer', 'customerName email phone')
      .populate('items.product', 'productName SKU')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: sales.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: sales
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single sale details
// @route   GET /api/sales/:id
// @access  Private
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'customerName email phone address city state gstNumber')
      .populate('items.product', 'productName SKU category sellingPrice')
      .populate('createdBy', 'name email');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    res.status(200).json({ success: true, data: sale });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new sale with stock verification & auto inventory update & invoice generation
// @route   POST /api/sales
// @access  Private (Admin, Manager, Accountant)
exports.createSale = async (req, res, next) => {
  try {
    const { customer, items, tax = 0, discount = 0, paymentMethod = 'cash', paymentStatus = 'paid' } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select a customer and at least one product item'
      });
    }

    let subTotal = 0;
    const processedItems = [];
    const invoiceItemDetails = [];

    // STEP 1: Verify product existence & check stock availability BEFORE processing
    for (const item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) {
        return res.status(404).json({
          success: false,
          message: `Product not found (ID: ${item.product})`
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (qty > productDoc.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${productDoc.productName}'. Requested: ${qty}, Available: ${productDoc.quantity}`
        });
      }

      const price = parseFloat(item.sellingPrice || productDoc.sellingPrice);
      const itemTotal = qty * price;
      subTotal += itemTotal;

      processedItems.push({
        product: productDoc._id,
        quantity: qty,
        sellingPrice: price,
        total: itemTotal
      });

      invoiceItemDetails.push({
        productName: productDoc.productName,
        quantity: qty,
        price,
        total: itemTotal
      });
    }

    const totalAmount = subTotal + parseFloat(tax) - parseFloat(discount);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    // STEP 2: Create Sale record
    const sale = await Sale.create({
      invoiceNumber,
      customer,
      items: processedItems,
      subTotal,
      tax: parseFloat(tax),
      discount: parseFloat(discount),
      totalAmount,
      paymentStatus,
      paymentMethod,
      status: 'completed',
      createdBy: req.user ? req.user._id : null
    });

    // STEP 3: Automatically decrease product inventory
    for (const item of processedItems) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      // Check if low stock threshold is reached after sale
      if (updatedProduct && updatedProduct.quantity <= updatedProduct.minimumStock) {
        await Notification.create({
          recipientRole: 'manager',
          title: 'Low Stock Alert',
          message: `Product '${updatedProduct.productName}' is now low in stock (${updatedProduct.quantity} units left).`,
          type: 'warning',
          link: '/products'
        });
      }
    }

    // STEP 4: Automatically create Invoice record
    await Invoice.create({
      invoiceNumber,
      sale: sale._id,
      customer,
      items: invoiceItemDetails,
      subTotal,
      tax: parseFloat(tax),
      discount: parseFloat(discount),
      totalAmount,
      paymentStatus: paymentStatus === 'paid' ? 'paid' : 'unpaid',
      issueDate: Date.now(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days due
    });

    await logAudit({
      req,
      action: 'SALE_CREATE',
      module: 'SALE',
      targetId: sale._id,
      description: `Created sale ${invoiceNumber} for total amount ₹${totalAmount}`
    });

    await Notification.create({
      recipientRole: 'manager',
      title: 'New Sale Recorded',
      message: `Sale ${invoiceNumber} completed for ₹${totalAmount.toFixed(2)}`,
      type: 'info',
      link: '/sales'
    });

    res.status(201).json({
      success: true,
      message: 'Sale completed, invoice generated, and inventory updated successfully',
      data: sale
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel sale & revert product inventory
// @route   PUT /api/sales/:id/cancel
// @access  Private (Admin, Manager)
exports.cancelSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    if (sale.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Sale is already cancelled' });
    }

    sale.status = 'cancelled';
    await sale.save();

    // Revert inventory quantity (add back stock)
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    // Update associated invoice status
    await Invoice.findOneAndUpdate({ sale: sale._id }, { paymentStatus: 'unpaid', notes: 'Sale Cancelled' });

    await logAudit({
      req,
      action: 'SALE_CANCEL',
      module: 'SALE',
      targetId: sale._id,
      description: `Cancelled sale ${sale.invoiceNumber} and restored inventory quantities`
    });

    res.status(200).json({
      success: true,
      message: 'Sale cancelled and product inventory restored',
      data: sale
    });
  } catch (err) {
    next(err);
  }
};
