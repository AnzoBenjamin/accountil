import { FETCH_ALL, ADD_NEW, UPDATE, DELETE, GET_INVOICE, START_LOADING, END_LOADING, FETCH_INVOICE_BY_USER } from '../actions/constants'

const initialState = { isLoading: true, invoices: [], inventoryItems: [] };

const invoices = (state = initialState, action) => {
    switch (action.type) {
        case START_LOADING:
            return { ...state, isLoading: true };
        case END_LOADING:
            return { ...state, isLoading: false };
        case FETCH_ALL:
            return {
                ...state,
                invoices: action.payload.data,
                currentPage: action.payload.currentPage,
                numberOfPages: action.payload.numberOfPages,
            };
        case FETCH_INVOICE_BY_USER:
            console.log('Reducer FETCH_INVOICE_BY_USER payload:', action.payload);
            return { 
                ...state, 
                invoices: action.payload.invoices, 
                inventoryItems: action.payload.inventoryItems 
            };
        case GET_INVOICE:
            return { ...state, invoice: action.payload };
        case ADD_NEW:
            return { ...state, invoices: [...state.invoices, action.payload] };
        case UPDATE:
            return { 
                ...state, 
                invoices: state.invoices.map((invoice) => 
                    invoice._id === action.payload._id ? action.payload : invoice
                ) 
            };
        case DELETE:
            return { 
                ...state, 
                invoices: state.invoices.filter((invoice) => invoice._id !== action.payload) 
            };
        default:
            return state;
    }
};

export default invoices;