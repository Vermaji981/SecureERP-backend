const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const logAudit = require('../utils/auditLogger');

// @desc    Get attendance records with filter
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.employee) {
      query.employee = req.query.employee;
    }

    if (req.query.date) {
      const targetDate = new Date(req.query.date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    if (req.query.month && req.query.year) {
      const month = parseInt(req.query.month, 10) - 1; // 0-indexed
      const year = parseInt(req.query.year, 10);
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'name employeeId designation department')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark attendance for employee
// @route   POST /api/attendance
// @access  Private (Admin, HR, Employee)
exports.markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;

    let targetEmployeeId = employeeId;

    // If regular employee, look up employee document tied to logged-in user
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp) {
        return res.status(404).json({
          success: false,
          message: 'Employee record associated with your user account was not found'
        });
      }
      targetEmployeeId = emp._id;
    }

    if (!targetEmployeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const recordDate = date ? new Date(date) : new Date();
    // Normalize to midnight UTC
    recordDate.setHours(0, 0, 0, 0);

    const existingRecord = await Attendance.findOne({
      employee: targetEmployeeId,
      date: recordDate
    });

    let attendance;
    if (existingRecord) {
      existingRecord.status = status || existingRecord.status;
      existingRecord.checkIn = checkIn || existingRecord.checkIn;
      existingRecord.checkOut = checkOut || existingRecord.checkOut;
      existingRecord.notes = notes !== undefined ? notes : existingRecord.notes;
      attendance = await existingRecord.save();
    } else {
      attendance = await Attendance.create({
        employee: targetEmployeeId,
        date: recordDate,
        status: status || 'Present',
        checkIn: checkIn || '09:00 AM',
        checkOut: checkOut || '06:00 PM',
        notes: notes || ''
      });
    }

    await logAudit({
      req,
      action: 'ATTENDANCE_MARK',
      module: 'ATTENDANCE',
      targetId: attendance._id,
      description: `Marked attendance for employee (${targetEmployeeId}) as ${attendance.status}`
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get attendance summary stats
// @route   GET /api/attendance/summary
// @access  Private
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;

    todayAttendance.forEach((rec) => {
      if (rec.status === 'Present') present++;
      if (rec.status === 'Absent') absent++;
      if (rec.status === 'Half Day') halfDay++;
      if (rec.status === 'Leave') leave++;
    });

    const unMarked = Math.max(0, totalEmployees - todayAttendance.length);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        todayRecords: todayAttendance.length,
        present,
        absent,
        halfDay,
        leave,
        unMarked
      }
    });
  } catch (err) {
    next(err);
  }
};
