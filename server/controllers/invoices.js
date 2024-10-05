import express from "express";
import mongoose from "mongoose";
import InvoiceModel from "../models/InvoiceModel.js";
import InventoryModel from "../models/InventoryModel.js"; // Import InventoryModel

// Helper function to trigger stock alerts
const checkStockThreshold = async (inventoryItem) => {
  if (inventoryItem.quantity < inventoryItem.threshold) {
    // Trigger an alert when stock falls below the threshold
    console.log(
      `Alert: Stock for ${inventoryItem.itemName} is below the threshold! Current quantity: ${inventoryItem.quantity}`
    );
    // You can extend this to send an email/SMS notification
  }
};

// Fetch invoices by user
export const getInvoicesByUser = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    const invoices = await InvoiceModel.find({ creator: searchQuery });
    res.status(200).json({ data: invoices });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get total count of invoices
export const getTotalCount = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    const totalCount = await InvoiceModel.countDocuments({
      creator: searchQuery,
    });
    res.status(200).json(totalCount);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Fetch all invoices
export const getInvoices = async (req, res) => {
  try {
    const allInvoices = await InvoiceModel.find({}).sort({ _id: -1 });
    res.status(200).json(allInvoices);
  } catch (error) {
    res.status(409).json(error.message);
  }
};

// Create new invoice and reduce stock
export const createInvoice = async (req, res) => {
  const invoice = req.body;
  const session = await mongoose.startSession(); // Start session for transactions
  session.startTransaction();

  try {
    // Loop through each item in the invoice
    for (const item of invoice.items) {
      const inventoryItem = await InventoryModel.findById(
        item.inventoryItem
      ).session(session);

      if (!inventoryItem) {
        throw new Error(
          `Inventory item with ID ${item.inventoryItem} not found.`
        );
      }

      if (inventoryItem.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for item: ${inventoryItem.itemName}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`
        );
      }

      // Reduce stock
      inventoryItem.quantity -= item.quantity;
      await inventoryItem.save({ session });

      // Check if the stock falls below the threshold and trigger alert
      await checkStockThreshold(inventoryItem);
    }

    const newInvoice = new InvoiceModel(invoice);
    await newInvoice.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(newInvoice);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(409).json({ message: error.message });
  }
};

// Fetch invoice by ID
export const getInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await InvoiceModel.findById(id);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// Update invoice and handle stock changes
export const updateInvoice = async (req, res) => {
  const { id: _id } = req.params;
  const invoice = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No invoice with that id");

  const session = await mongoose.startSession(); // Start session for transactions
  session.startTransaction();

  try {
    const existingInvoice = await InvoiceModel.findById(_id).session(session);
    if (!existingInvoice) throw new Error("Invoice not found");

    // Revert previous stock adjustments
    for (const item of existingInvoice.items) {
      const inventoryItem = await InventoryModel.findById(
        item.inventoryItem
      ).session(session);
      if (inventoryItem) {
        inventoryItem.quantity += item.quantity; // Add back the previous quantity
        await inventoryItem.save({ session });
      }
    }

    // Update stock for new invoice data
    for (const item of invoice.items) {
      const inventoryItem = await InventoryModel.findById(
        item.inventoryItem
      ).session(session);

      if (!inventoryItem) {
        throw new Error(
          `Inventory item with ID ${item.inventoryItem} not found.`
        );
      }

      if (inventoryItem.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for item: ${inventoryItem.itemName}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`
        );
      }

      inventoryItem.quantity -= item.quantity;
      await inventoryItem.save({ session });

      // Check if stock falls below threshold and trigger alert
      await checkStockThreshold(inventoryItem);
    }

    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      _id,
      { ...invoice, _id },
      { new: true, session }
    );
    await session.commitTransaction();
    session.endSession();

    res.json(updatedInvoice);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(409).json({ message: error.message });
  }
};

// Delete invoice and revert stock
export const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  const session = await mongoose.startSession(); // Start session for transactions
  session.startTransaction();

  try {
    const invoice = await InvoiceModel.findById(id).session(session);
    if (!invoice) throw new Error("Invoice not found");

    // Revert stock adjustments
    for (const item of invoice.items) {
      const inventoryItem = await InventoryModel.findById(
        item.inventoryItem
      ).session(session);
      if (inventoryItem) {
        inventoryItem.quantity += item.quantity; // Add back the sold quantity
        await inventoryItem.save({ session });
      }
    }

    await InvoiceModel.findByIdAndRemove(id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(409).json({ message: error.message });
  }
};
