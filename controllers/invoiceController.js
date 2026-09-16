const Invoice = require('../models/Invoice');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Admin, Manager, Accountant)
exports.getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Invoice.countDocuments();
    const invoices = await Invoice.find()
      .populate('customer', 'customerName email phone address city state gstNumber')
      .populate('sale')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: invoices.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: invoices
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single invoice details
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'customerName email phone address city state country gstNumber')
      .populate('sale');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};
