const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0
    },
    grossSalary: {
      type: Number,
      required: true
    },
    netSalary: {
      type: Number,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Processing'],
      default: 'Pending'
    },
    paymentDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
