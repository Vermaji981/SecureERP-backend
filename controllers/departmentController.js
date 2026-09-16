const Department = require('../models/Department');
const logAudit = require('../utils/auditLogger');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'name email employeeId designation')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin, HR)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, manager, status } = req.body;

    const deptExists = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (deptExists) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    const department = await Department.create({
      name,
      description: description || '',
      manager: manager || null,
      status: status || 'active'
    });

    await logAudit({
      req,
      action: 'DEPARTMENT_CREATE',
      module: 'DEPARTMENT',
      targetId: department._id,
      description: `Created department ${department.name}`
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin, HR)
exports.updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('manager', 'name email');

    await logAudit({
      req,
      action: 'DEPARTMENT_UPDATE',
      module: 'DEPARTMENT',
      targetId: department._id,
      description: `Updated department ${department.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin, HR)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await department.deleteOne();

    await logAudit({
      req,
      action: 'DEPARTMENT_DELETE',
      module: 'DEPARTMENT',
      targetId: req.params.id,
      description: `Deleted department ${department.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
