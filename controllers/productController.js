const Product = require('../models/Product');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc    Get all products with pagination, search, filter, low-stock filter
// @route   GET /api/products
// @access  Private (Admin, Manager, Accountant)
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { productName: searchRegex },
        { SKU: searchRegex },
        { category: searchRegex }
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('supplier', 'supplierName companyName')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'supplierName companyName phone email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Manager)
exports.createProduct = async (req, res, next) => {
  try {
    const { productName, SKU, category, description, purchasePrice, sellingPrice, quantity, minimumStock, supplier, status } = req.body;

    const existingProduct = await Product.findOne({ SKU });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = await Product.create({
      productName,
      SKU,
      category,
      description: description || '',
      purchasePrice,
      sellingPrice,
      quantity: quantity || 0,
      minimumStock: minimumStock || 5,
      supplier: supplier || null,
      status: status || 'active'
    });

    await logAudit({
      req,
      action: 'PRODUCT_CREATE',
      module: 'PRODUCT',
      targetId: product._id,
      description: `Created product ${productName} (SKU: ${SKU})`
    });

    // Check low stock on creation
    if (product.quantity <= product.minimumStock) {
      await Notification.create({
        recipientRole: 'manager',
        title: 'Low Stock Alert',
        message: `Product ${product.productName} (SKU: ${product.SKU}) is low in stock (${product.quantity} units remaining).`,
        type: 'warning',
        link: '/products'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('supplier', 'supplierName companyName');

    await logAudit({
      req,
      action: 'PRODUCT_UPDATE',
      module: 'PRODUCT',
      targetId: product._id,
      description: `Updated product ${product.productName}`
    });

    if (product.quantity <= product.minimumStock) {
      await Notification.create({
        recipientRole: 'manager',
        title: 'Low Stock Alert',
        message: `Product ${product.productName} is low in stock (${product.quantity} remaining).`,
        type: 'warning',
        link: '/products'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin, Manager)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    await logAudit({
      req,
      action: 'PRODUCT_DELETE',
      module: 'PRODUCT',
      targetId: req.params.id,
      description: `Deleted product ${product.productName}`
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
