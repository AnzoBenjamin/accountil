import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  supplier: {
    name: String,
    contactEmail: String,
    phone: String,
    address: String,
  },
  category: {
    type: String,
    default: 'General',
  },
  threshold: {
    type: Number,
    default: 0,  // Minimum stock level for restocking alert
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const InventoryModel = mongoose.model('InventoryModel', InventorySchema);

export default InventoryModel;
