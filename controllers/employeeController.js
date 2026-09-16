const Employee = require('../models/Employee');
const User = require('../models/User');
const logAudit = require('../utils/auditLogger');

// @desc    Get all employees with pagination, search & filter
// @route   GET /api/employees
// @access  Private (Admin, Manager, HR)
exports.getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex }
      ];
    }

    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('user', 'name email role status')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: employees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private (Admin, Manager, HR)
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name description')
      .populate('user', 'name email role status');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, HR)
exports.createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, phone, department, designation, joiningDate, salary, address, profileImage } = req.body;

    const existingEmp = await Employee.findOne({ $or: [{ employeeId }, { email }] });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this Employee ID or Email already exists'
      });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate: joiningDate || Date.now(),
      salary,
      address: address || '',
      profileImage: profileImage || ''
    });

    await logAudit({
      req,
      action: 'EMPLOYEE_CREATE',
      module: 'EMPLOYEE',
      targetId: employee._id,
      description: `Created employee ${name} (${employeeId})`
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR)
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('department', 'name');

    await logAudit({
      req,
      action: 'EMPLOYEE_UPDATE',
      module: 'EMPLOYEE',
      targetId: employee._id,
      description: `Updated employee details for ${employee.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin, HR)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = 'inactive';
    await employee.save();

    await logAudit({
      req,
      action: 'EMPLOYEE_DEACTIVATE',
      module: 'EMPLOYEE',
      targetId: employee._id,
      description: `Deactivated employee ${employee.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
      data: employee
    });
  } catch (err) {
    next(err);
  }
};
