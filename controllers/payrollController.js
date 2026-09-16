const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const logAudit = require('../utils/auditLogger');

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private (Admin, Accountant, HR)
exports.getPayroll = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.employee) {
      query.employee = req.query.employee;
    }
    if (req.query.month) {
      query.month = req.query.month;
    }
    if (req.query.year) {
      query.year = parseInt(req.query.year, 10);
    }
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    const payrolls = await Payroll.find(query)
      .populate({
        path: 'employee',
        select: 'name employeeId designation department email salary',
        populate: { path: 'department', select: 'name' }
      })
      .sort({ year: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate / Create payroll entry for an employee
// @route   POST /api/payroll
// @access  Private (Admin, Accountant)
exports.createPayroll = async (req, res, next) => {
  try {
    const { employee, basicSalary, allowances = 0, bonus = 0, deductions = 0, month, year, paymentStatus = 'Pending' } = req.body;

    const empDoc = await Employee.findById(employee);
    if (!empDoc) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const base = parseFloat(basicSalary || empDoc.salary || 0);
    const allow = parseFloat(allowances);
    const bon = parseFloat(bonus);
    const ded = parseFloat(deductions);

    // Formulas:
    // Gross Salary = Basic Salary + Allowances + Bonus
    // Net Salary = Gross Salary - Deductions
    const grossSalary = base + allow + bon;
    const netSalary = Math.max(0, grossSalary - ded);

    const existingPayroll = await Payroll.findOne({ employee, month, year });
    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: `Payroll record already exists for ${empDoc.name} for ${month} ${year}`
      });
    }

    const payroll = await Payroll.create({
      employee,
      basicSalary: base,
      allowances: allow,
      bonus: bon,
      deductions: ded,
      grossSalary,
      netSalary,
      month,
      year: parseInt(year, 10),
      paymentStatus,
      paymentDate: paymentStatus === 'Paid' ? Date.now() : null
    });

    await logAudit({
      req,
      action: 'PAYROLL_CREATE',
      module: 'PAYROLL',
      targetId: payroll._id,
      description: `Generated payroll for ${empDoc.name} (${month} ${year}) - Net: ₹${netSalary}`
    });

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: payroll
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update payroll payment status (Mark Paid / Pending)
// @route   PUT /api/payroll/:id
// @access  Private (Admin, Accountant)
exports.updatePayrollStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    let payroll = await Payroll.findById(req.params.id).populate('employee', 'name email');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    payroll.paymentStatus = paymentStatus || payroll.paymentStatus;
    if (paymentStatus === 'Paid') {
      payroll.paymentDate = Date.now();
    }
    await payroll.save();

    await logAudit({
      req,
      action: 'PAYROLL_STATUS_UPDATE',
      module: 'PAYROLL',
      targetId: payroll._id,
      description: `Updated payroll status to ${payroll.paymentStatus} for ${payroll.employee ? payroll.employee.name : 'employee'}`
    });

    res.status(200).json({
      success: true,
      message: 'Payroll status updated successfully',
      data: payroll
    });
  } catch (err) {
    next(err);
  }
};
