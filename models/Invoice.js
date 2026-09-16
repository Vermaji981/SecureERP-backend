const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    items: [
      {
        productName: String,
        quantity: Number,
        price: Number,
        total: Number
      }
    ],
    subTotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'partially_paid'],
      default: 'paid'
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date
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

module.exports = mongoose.model('Invoice', InvoiceSchema);
