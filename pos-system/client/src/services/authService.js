import { jwtDecode } from 'jwt-decode';
import { ActionTypes } from '../context/AppContext';

export class AuthService {
  static TOKEN_KEY = 'token';

  static setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isTokenValid(token = null) {
    const authToken = token || this.getToken();
    if (!authToken) return false;

    try {
      const decoded = jwtDecode(authToken);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  static getDecodedToken(token = null) {
    const authToken = token || this.getToken();
    if (!authToken) return null;

    try {
      return jwtDecode(authToken);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  static getCurrentUser() {
    const decoded = this.getDecodedToken();
    return decoded?.user || null;
  }

  static login(token, dispatch) {
    try {
      if (!this.isTokenValid(token)) {
        throw new Error('Invalid token received');
      }

      this.setToken(token);
      const decoded = jwtDecode(token);
      
      dispatch({
        type: ActionTypes.SET_USER,
        payload: decoded.user
      });

      return { success: true, user: decoded.user };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: 'Authentication failed'
      });
      return { success: false, error: error.message };
    }
  }

  static logout(dispatch) {
    this.removeToken();
    
    // Clear any cached data
    sessionStorage.clear();
    
    dispatch({ type: ActionTypes.LOGOUT });
  }

  static refreshUserData(dispatch) {
    const token = this.getToken();
    if (this.isTokenValid(token)) {
      const decoded = this.getDecodedToken(token);
      dispatch({
        type: ActionTypes.SET_USER,
        payload: decoded.user
      });
    } else {
      this.logout(dispatch);
    }
  }
}
