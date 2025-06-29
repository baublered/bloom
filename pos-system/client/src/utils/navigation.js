import { useLocation } from 'react-router-dom';

// Utility to determine the correct navigation path based on current location
export const useRoleBasedNavigation = () => {
  const location = useLocation();
  const isEmployeeDashboard = location.pathname.startsWith('/employee-dashboard');

  const getNavigationPath = (path) => {
    // If we're in employee dashboard context, prefix with employee-dashboard
    if (isEmployeeDashboard) {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `/employee-dashboard/${cleanPath}`;
    }
    // For admin context, return the original path
    return path;
  };

  return { getNavigationPath, isEmployeeDashboard };
};
