/**
 * Centralized navigation utility
 * Handles all role-based navigation consistently across the application
 */

import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export class NavigationManager {
  static getBasePath(userRole) {
    switch (userRole) {
      case 'admin':
        return '';
      case 'employee':
        return '/employee-dashboard';
      default:
        return '';
    }
  }

  static getDashboardPath(userRole) {
    switch (userRole) {
      case 'admin':
        return '/dashboard';
      case 'employee':
        return '/employee-dashboard';
      default:
        return '/';
    }
  }

  static getRoutePath(userRole, route) {
    const basePath = this.getBasePath(userRole);
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
    
    if (userRole === 'employee') {
      return `${basePath}${cleanRoute}`;
    }
    
    return cleanRoute;
  }

  static canAccessRoute(userRole, route) {
    const restrictedAdminRoutes = [
      '/reports',
      '/user-registration', 
      '/product-registration',
      '/maintenance',
      '/restock',
      '/edit-product',
      '/backup'
    ];

    const restrictedEmployeeRoutes = [
      '/dashboard',
      '/profile' // When not in employee context
    ];

    if (userRole === 'employee') {
      return !restrictedAdminRoutes.some(restricted => 
        route.includes(restricted.replace('/', ''))
      );
    }

    if (userRole === 'admin') {
      // Admins can access everything except employee-specific routes
      return !route.startsWith('/employee-dashboard');
    }

    return false;
  }

  static getRedirectPath(userRole, intendedRoute) {
    if (!this.canAccessRoute(userRole, intendedRoute)) {
      return this.getDashboardPath(userRole);
    }
    return intendedRoute;
  }

  static getAllowedRoutes(userRole) {
    const commonRoutes = [
      'retail',
      'events', 
      'inventory',
      'help',
      'about',
      'billing-retail',
      'billing-events',
      'product-selection',
      'retail-payment',
      'events-payment',
      'receipt'
    ];

    if (userRole === 'admin') {
      return [
        ...commonRoutes,
        'reports',
        'user-registration',
        'product-registration', 
        'maintenance',
        'restock',
        'edit-product',
        'backup',
        'profile'
      ];
    }

    if (userRole === 'employee') {
      return [
        ...commonRoutes,
        'profile' // Only in employee context
      ];
    }

    return [];
  }
}

/**
 * Navigation hook that provides role-aware navigation functions
 */
export const useRoleNavigation = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const userRole = state.user?.role;

  const navigateToRoute = (route) => {
    const targetPath = NavigationManager.getRoutePath(userRole, route);
    const allowedPath = NavigationManager.getRedirectPath(userRole, targetPath);
    navigate(allowedPath);
  };

  const navigateToDashboard = () => {
    const dashboardPath = NavigationManager.getDashboardPath(userRole);
    navigate(dashboardPath);
  };

  const navigateToProfile = () => {
    if (userRole === 'employee') {
      navigate('/employee-dashboard/profile');
    } else {
      navigate('/profile');
    }
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const canAccess = (route) => {
    return NavigationManager.canAccessRoute(userRole, route);
  };

  return {
    navigateToRoute,
    navigateToDashboard,
    navigateToProfile,
    navigateBack,
    canAccess,
    userRole,
    getAllowedRoutes: () => NavigationManager.getAllowedRoutes(userRole)
  };
};
