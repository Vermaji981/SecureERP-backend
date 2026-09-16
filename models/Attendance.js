const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave'],
      required: true
    },
    checkIn: {
      type: String,
      default: ''
    },
    checkOut: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
