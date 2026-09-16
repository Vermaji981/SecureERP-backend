const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Please add customer name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add email'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
      trim: true
    },
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'India'
    },
    gstNumber: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', CustomerSchema);
