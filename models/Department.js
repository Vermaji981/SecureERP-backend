const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a department name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
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

module.exports = mongoose.model('Department', DepartmentSchema);
