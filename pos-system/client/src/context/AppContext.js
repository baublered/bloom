import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  cart: [],
  totalAmount: 0,
  loading: false,
  error: null,
  currentRoute: '/'
};

// Action types
export const ActionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SET_CURRENT_ROUTE: 'SET_CURRENT_ROUTE'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: [],
        totalAmount: 0
      };
    
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ActionTypes.ADD_TO_CART:
      const existingItem = state.cart.find(item => item._id === action.payload._id);
      let newCart;
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        newCart = [...state.cart, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
      
      const newTotal = newCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: newCart,
        totalAmount: newTotal
      };
    
    case ActionTypes.REMOVE_FROM_CART:
      const filteredCart = state.cart.filter(item => item._id !== action.payload);
      const updatedTotal = filteredCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: filteredCart,
        totalAmount: updatedTotal
      };
    
    case ActionTypes.UPDATE_CART_ITEM:
      const updatedCart = state.cart.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const recalculatedTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: updatedCart,
        totalAmount: recalculatedTotal
      };
    
    case ActionTypes.CLEAR_CART:
      return {
        ...state,
        cart: [],
        totalAmount: 0
      };
    
    case ActionTypes.LOAD_CART:
      const loadedTotal = action.payload.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      return {
        ...state,
        cart: action.payload.cart,
        totalAmount: loadedTotal
      };
    
    case ActionTypes.SET_CURRENT_ROUTE:
      return {
        ...state,
        currentRoute: action.payload
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize user from token on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          dispatch({ type: ActionTypes.SET_USER, payload: decodedToken.user });
        } else {
          // Token expired
          localStorage.removeItem('token');
          dispatch({ type: ActionTypes.LOGOUT });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        dispatch({ type: ActionTypes.LOGOUT });
      }
    }
  }, []);

  // Sync cart with sessionStorage
  useEffect(() => {
    if (state.cart.length > 0) {
      sessionStorage.setItem('cart', JSON.stringify(state.cart));
      sessionStorage.setItem('totalAmount', state.totalAmount.toString());
    } else {
      sessionStorage.removeItem('cart');
      sessionStorage.removeItem('totalAmount');
    }
  }, [state.cart, state.totalAmount]);

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    const savedTotal = sessionStorage.getItem('totalAmount');
    
    if (savedCart && savedTotal) {
      try {
        const cart = JSON.parse(savedCart);
        
        // Load the entire cart at once
        dispatch({ 
          type: ActionTypes.LOAD_CART, 
          payload: { cart } 
        });
      } catch (error) {
        console.error('Error loading cart from sessionStorage:', error);
      }
    }
  }, []);

  const value = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
