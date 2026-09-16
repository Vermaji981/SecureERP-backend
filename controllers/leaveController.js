const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc    Get leave requests (Employees see own requests; Admin/HR/Manager see all)
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
  try {
    const query = {};

    // Filter by employee if user role is employee
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ email: req.user.email });
      if (emp) {
        query.employee = emp._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    } else if (req.query.employee) {
      query.employee = req.query.employee;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId designation department email')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private (Employee, All)
exports.createLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, employeeId } = req.body;

    let targetEmployeeId = employeeId;

    if (req.user.role === 'employee' || !targetEmployeeId) {
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp) {
        return res.status(404).json({
          success: false,
          message: 'Employee record associated with your account was not found'
        });
      }
      targetEmployeeId = emp._id;
    }

    const leave = await Leave.create({
      employee: targetEmployeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    await logAudit({
      req,
      action: 'LEAVE_REQUEST',
      module: 'LEAVE',
      targetId: leave._id,
      description: `Submitted ${leaveType} request from ${startDate} to ${endDate}`
    });

    await Notification.create({
      recipientRole: 'hr',
      title: 'New Leave Request',
      message: `A new ${leaveType} request has been submitted for review.`,
      type: 'info',
      link: '/leaves'
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin, HR, Manager)
exports.approveLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee', 'name email');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    await leave.save();

    await logAudit({
      req,
      action: 'LEAVE_APPROVE',
      module: 'LEAVE',
      targetId: leave._id,
      description: `Approved leave request for ${leave.employee ? leave.employee.name : 'employee'}`
    });

    await Notification.create({
      recipientRole: 'all',
      title: 'Leave Request Approved',
      message: `Your ${leave.leaveType} request has been APPROVED by ${req.user.name}.`,
      type: 'success',
      link: '/leaves'
    });

    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin, HR, Manager)
exports.rejectLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee', 'name email');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user._id;
    await leave.save();

    await logAudit({
      req,
      action: 'LEAVE_REJECT',
      module: 'LEAVE',
      targetId: leave._id,
      description: `Rejected leave request for ${leave.employee ? leave.employee.name : 'employee'}`
    });

    await Notification.create({
      recipientRole: 'all',
      title: 'Leave Request Rejected',
      message: `Your ${leave.leaveType} request was REJECTED by ${req.user.name}.`,
      type: 'error',
      link: '/leaves'
    });

    res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel leave request (Employee can cancel own pending request)
// @route   PUT /api/leaves/:id/cancel
// @access  Private
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending leave requests can be cancelled' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled',
      data: leave
    });
  } catch (err) {
    next(err);
  }
};
