import InventoryModel from '../models/InventoryModel.js';

// Create a new inventory item
export const createInventoryItem = async (req, res) => {
  const { itemName, sku, quantity, unitPrice, supplier, category, threshold, description, creator } = req.body;

  try {
    const newItem = new InventoryModel({
      itemName,
      sku,
      quantity,
      unitPrice,
      supplier,
      category,
      threshold,
      description,
      creator
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating inventory item', error });
  }
};

// Get all inventory items
export const getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryModel.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error });
  }
};

// Get a single inventory item by ID
export const getInventoryItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await InventoryModel.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error });
  }
};

// Update inventory item by ID
export const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { itemName, quantity, unitPrice, supplier, category, threshold, description } = req.body;

  try {
    const updatedItem = await InventoryModel.findByIdAndUpdate(
      id,
      { itemName, quantity, unitPrice, supplier, category, threshold, description },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error });
  }
};

// Delete inventory item by ID
export const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await InventoryModel.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error });
  }
};

// Add this new function
export const getInventoryByUser = async (req, res) => {
  const { id: _id } = req.params;
  console.log(_id)

  try {
    const inventoryItems = await InventoryModel.find({ creator: _id });
    res.status(200).json({ data: inventoryItems });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
