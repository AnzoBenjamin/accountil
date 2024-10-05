import { 
    FETCH_INVENTORY, 
    ADD_NEW_INVENTORY, 
    UPDATE_INVENTORY, 
    DELETE_INVENTORY, 
    FETCH_INVENTORY_BY_ID, 
    INVENTORY_LOADING_START, 
    INVENTORY_LOADING_END 
} from '../actions/constants';

const inventory = (state = { isLoading: true, inventoryItems: [] }, action) => {
    switch (action.type) {
        case INVENTORY_LOADING_START:
            return { ...state, isLoading: true };
        
        case INVENTORY_LOADING_END:
            return { ...state, isLoading: false };
        
        case FETCH_INVENTORY:
            return {
                ...state,
                inventoryItems: action.payload,  // assuming payload contains all inventory items
            };
        
        case FETCH_INVENTORY_BY_ID:
            return {
                ...state,
                inventoryItem: action.payload,  // assuming payload contains a single inventory item
            };
        
        case ADD_NEW_INVENTORY:
            return {
                ...state,
                inventoryItems: [...state.inventoryItems, action.payload],  // add new item to the list
            };
        
        case UPDATE_INVENTORY:
            return {
                ...state,
                inventoryItems: state.inventoryItems.map((item) => 
                    item._id === action.payload._id ? action.payload : item
                ),
            };
        
        case DELETE_INVENTORY:
            return {
                ...state,
                inventoryItems: state.inventoryItems.filter((item) => item._id !== action.payload),
            };
        
        default:
            return state;
    }
};

export default inventory;
