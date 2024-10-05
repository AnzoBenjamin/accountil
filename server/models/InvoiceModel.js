import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  dueDate: Date,
  currency: String,
  items: [
    {
      inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryModel' }, // Link to InventoryModel
      quantity: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
    }
  ],
  rates: String,
  vat: Number,
  total: Number,
  subTotal: Number,
  notes: String,
  status: String,
  invoiceNumber: String,
  type: String,
  creator: [String],
  totalAmountReceived: Number,
  client: { name: String, email: String, phone: String, address: String },
  paymentRecords: [
    {
      amountPaid: Number,
      datePaid: Date,
      paymentMethod: String,
      note: String,
      paidBy: String,
    }
  ],
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const InvoiceModel = mongoose.model('InvoiceModel', InvoiceSchema);

export default InvoiceModel;
