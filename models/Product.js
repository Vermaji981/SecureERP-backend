const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Please add product name'],
      trim: true
    },
    SKU: {
      type: String,
      required: [true, 'Please add SKU'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please specify product category'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Please specify purchase price'],
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please specify selling price'],
      min: 0
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify current stock quantity'],
      min: 0,
      default: 0
    },
    minimumStock: {
      type: Number,
      default: 5,
      min: 0
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', ProductSchema);
