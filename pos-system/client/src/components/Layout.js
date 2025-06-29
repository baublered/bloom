import React from 'react';
import { useAppContext } from '../context/AppContext';
import Sidebar from '../pages/Sidebar';
import EmployeeSidebar from '../pages/EmployeeSidebar';
import UserProfile from '../pages/UserProfile';
import './Layout.css';

/**
 * Base Layout component that handles sidebar and header rendering
 * based on user role and current route
 */
const Layout = ({ children, showSidebar = true, showHeader = true, title }) => {
  const { state } = useAppContext();
  const { user, currentRoute } = state;
  
  // Determine if we're in a standalone context (no sidebar/header needed)
  const isStandaloneRoute = currentRoute.includes('/billing-') || 
                           currentRoute.includes('/payment') || 
                           currentRoute.includes('/receipt') ||
                           currentRoute.includes('/product-selection');

  // Don't render layout for standalone routes
  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  const isEmployeeDashboard = currentRoute.startsWith('/employee-dashboard');
  const userRole = user?.role;

  // Determine which sidebar to show
  const SidebarComponent = isEmployeeDashboard || userRole === 'employee' ? EmployeeSidebar : Sidebar;

  return (
    <div className="layout-container">
      {showSidebar && <SidebarComponent />}
      
      <main className="layout-main">
        {showHeader && (
          <header className="layout-header">
            <div className="header-left">
              {title && <h1>{title}</h1>}
            </div>
            <div className="header-right">
              <UserProfile />
            </div>
          </header>
        )}
        
        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
};

/**
 * Admin Layout - ensures admin context
 */
export const AdminLayout = ({ children, title }) => {
  const { state } = useAppContext();
  
  if (state.user?.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <Layout title={title} showSidebar={true} showHeader={true}>
      {children}
    </Layout>
  );
};

/**
 * Employee Layout - ensures employee context  
 */
export const EmployeeLayout = ({ children, title }) => {
  const { state } = useAppContext();
  
  if (state.user?.role !== 'employee') {
    return <div>Access denied. Employee privileges required.</div>;
  }

  return (
    <Layout title={title} showSidebar={true} showHeader={true}>
      {children}
    </Layout>
  );
};

/**
 * Shared Layout - for routes accessible by both roles
 */
export const SharedLayout = ({ children, title }) => {
  return (
    <Layout title={title} showSidebar={true} showHeader={true}>
      {children}
    </Layout>
  );
};

/**
 * Minimal Layout - no sidebar, optional header
 */
export const MinimalLayout = ({ children, title, showHeader = false }) => {
  return (
    <Layout title={title} showSidebar={false} showHeader={showHeader}>
      {children}
    </Layout>
  );
};

export default Layout;
