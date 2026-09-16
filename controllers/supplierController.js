const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const logAudit = require('../utils/auditLogger');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin, Manager, Accountant)
exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ companyName: 1 });
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single supplier with purchase history
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const purchases = await Purchase.find({ supplier: supplier._id })
      .populate('items.product', 'productName SKU')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        supplier,
        purchases
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Manager)
exports.createSupplier = async (req, res, next) => {
  try {
    const { supplierName, companyName, email, phone, address, gstNumber, status } = req.body;

    const supplier = await Supplier.create({
      supplierName,
      companyName,
      email,
      phone,
      address: address || '',
      gstNumber: gstNumber || '',
      status: status || 'active'
    });

    await logAudit({
      req,
      action: 'SUPPLIER_CREATE',
      module: 'SUPPLIER',
      targetId: supplier._id,
      description: `Created supplier ${companyName} (${supplierName})`
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Manager)
exports.updateSupplier = async (req, res, next) => {
  try {
    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await logAudit({
      req,
      action: 'SUPPLIER_UPDATE',
      module: 'SUPPLIER',
      targetId: supplier._id,
      description: `Updated supplier ${supplier.companyName}`
    });

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin, Manager)
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await supplier.deleteOne();

    await logAudit({
      req,
      action: 'SUPPLIER_DELETE',
      module: 'SUPPLIER',
      targetId: req.params.id,
      description: `Deleted supplier ${supplier.companyName}`
    });

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
