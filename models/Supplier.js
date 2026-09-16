const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: [true, 'Please add supplier contact name'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Please add company name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add supplier email'],
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

module.exports = mongoose.model('Supplier', SupplierSchema);
