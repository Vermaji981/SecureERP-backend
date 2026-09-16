const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const logAudit = require('../utils/auditLogger');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin, Manager, Accountant)
exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ customerName: 1 });
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single customer with sales history
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const sales = await Sale.find({ customer: customer._id })
      .populate('items.product', 'productName SKU')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        customer,
        sales
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private (Admin, Manager)
exports.createCustomer = async (req, res, next) => {
  try {
    const { customerName, email, phone, address, city, state, country, gstNumber, status } = req.body;

    const customer = await Customer.create({
      customerName,
      email,
      phone,
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || 'India',
      gstNumber: gstNumber || '',
      status: status || 'active'
    });

    await logAudit({
      req,
      action: 'CUSTOMER_CREATE',
      module: 'CUSTOMER',
      targetId: customer._id,
      description: `Created customer ${customerName}`
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin, Manager)
exports.updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await logAudit({
      req,
      action: 'CUSTOMER_UPDATE',
      module: 'CUSTOMER',
      targetId: customer._id,
      description: `Updated customer ${customer.customerName}`
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Manager)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.deleteOne();

    await logAudit({
      req,
      action: 'CUSTOMER_DELETE',
      module: 'CUSTOMER',
      targetId: req.params.id,
      description: `Deleted customer ${customer.customerName}`
    });

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
