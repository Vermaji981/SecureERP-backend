const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add expense title'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Utilities', 'Rent', 'Salaries', 'Marketing', 'Office Supplies', 'Maintenance', 'Travel', 'Other'],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please specify expense amount'],
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
