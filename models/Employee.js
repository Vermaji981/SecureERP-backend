const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please add employee name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add employee email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please specify department']
    },
    designation: {
      type: String,
      required: [true, 'Please specify designation'],
      trim: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    salary: {
      type: Number,
      required: [true, 'Please specify basic salary'],
      min: 0
    },
    address: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active'
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
