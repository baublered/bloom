import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RoleProtectedRoute = ({ children, allowedRoles = [], restrictedForRoles = [] }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.user.role;
    
    // If user's role is in the restricted list, redirect to dashboard
    if (restrictedForRoles.length > 0 && restrictedForRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // If allowedRoles is specified and user's role is not in it, redirect
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // If user passes all checks, render the component
    return children;
    
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token'); // Remove invalid token
    return <Navigate to="/login" replace />;
  }
};

export default RoleProtectedRoute;
