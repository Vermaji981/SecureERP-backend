const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const SaleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    items: [SaleItemSchema],
    subTotal: {
      type: Number,
      required: true,
      default: 0
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
      required: true,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'paid'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'upi'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed'
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

module.exports = mongoose.model('Sale', SaleSchema);
