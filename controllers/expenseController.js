const Expense = require('../models/Expense');
const logAudit = require('../utils/auditLogger');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin, Accountant)
exports.getExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: expenses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private (Admin, Accountant)
exports.createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, date, description } = req.body;

    const expense = await Expense.create({
      title,
      category,
      amount,
      date: date || Date.now(),
      description: description || '',
      createdBy: req.user ? req.user._id : null
    });

    await logAudit({
      req,
      action: 'EXPENSE_CREATE',
      module: 'EXPENSE',
      targetId: expense._id,
      description: `Created expense '${title}' of ₹${amount} [${category}]`
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Admin, Accountant)
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await logAudit({
      req,
      action: 'EXPENSE_UPDATE',
      module: 'EXPENSE',
      targetId: expense._id,
      description: `Updated expense '${expense.title}'`
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, Accountant)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.deleteOne();

    await logAudit({
      req,
      action: 'EXPENSE_DELETE',
      module: 'EXPENSE',
      targetId: req.params.id,
      description: `Deleted expense '${expense.title}'`
    });

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
