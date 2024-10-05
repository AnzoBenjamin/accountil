import * as api from '../api/index'; // API calls to interact with the backend
import { 
    ADD_NEW_INVENTORY, 
    UPDATE_INVENTORY, 
    DELETE_INVENTORY, 
    FETCH_INVENTORY, 
    FETCH_INVENTORY_BY_ID, 
    INVENTORY_LOADING_START, 
    INVENTORY_LOADING_END 
} from './constants';

// Fetch all inventory items
export const getInventoryItems = () => async (dispatch) => {
    try {
        dispatch({ type: INVENTORY_LOADING_START });
        
        const { data } = await api.fetchInventoryItems(); // API call to get inventory items
        
        dispatch({ type: FETCH_INVENTORY, payload: data });
        
        dispatch({ type: INVENTORY_LOADING_END });
    } catch (error) {
        console.log(error.response);
    }
};

// Fetch a single inventory item by ID
export const getInventoryItem = (id) => async (dispatch) => {
    try {
        dispatch({ type: INVENTORY_LOADING_START });
        
        const { data } = await api.fetchInventoryItemById(id); // API call to get an item by ID
        
        dispatch({ type: FETCH_INVENTORY_BY_ID, payload: data });
        
        dispatch({ type: INVENTORY_LOADING_END });
    } catch (error) {
        console.log(error.response);
    }
};

// Create a new inventory item
export const createInventoryItem = (item, history) => async (dispatch) => {
    try {
        dispatch({ type: INVENTORY_LOADING_START });
        
        const { data } = await api.addInventoryItem(item);
        
        dispatch({ type: ADD_NEW_INVENTORY, payload: data });
        
        history.push(`/inventory/${data._id}`);
        
        dispatch({ type: INVENTORY_LOADING_END });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        dispatch({ type: INVENTORY_LOADING_END });
        if (error.response && error.response.data) {
            if (error.response.data.message.includes('duplicate key error')) {
                alert('An item with this SKU already exists.');
            } else {
                alert('Error creating inventory item: ' + error.response.data.message);
            }
        } else {
            alert('An error occurred while creating the inventory item.');
        }
    }
};

// Update an existing inventory item by ID
export const updateInventoryItem = (id, updatedItem) => async (dispatch) => {
    try {
      dispatch({ type: INVENTORY_LOADING_START });
      
      const { data } = await api.updateInventoryItem(id, updatedItem);
      
      dispatch({ type: UPDATE_INVENTORY, payload: data });
      
      dispatch({ type: INVENTORY_LOADING_END });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      dispatch({ type: INVENTORY_LOADING_END });
      if (error.response && error.response.data) {
        alert('Error updating inventory item: ' + error.response.data.message);
      } else {
        alert('An error occurred while updating the inventory item.');
      }
    }
  };

// Delete an inventory item by ID
export const deleteInventoryItem = (id, openSnackbar) => async (dispatch) => {
    try {
        await api.deleteInventoryItem(id); // API call to delete inventory item
        
        dispatch({ type: DELETE_INVENTORY, payload: id });
        
        openSnackbar("Inventory item deleted successfully");
    } catch (error) {
        console.log(error.response);
    }
};
