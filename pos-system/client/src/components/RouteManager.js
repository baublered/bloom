import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ActionTypes } from '../context/AppContext';
import { AdminLayout, EmployeeLayout, MinimalLayout } from './Layout';
import RoleProtectedRoute from './RoleProtectedRoute';

// Import all page components
import About from '../pages/About';
import Backup from '../pages/Backup';
import BillingEvents from '../pages/BillingEvents';
import BillingRetail from '../pages/BillingRetail';
import CreatePurchaseOrder from '../pages/CreatePurchaseOrder';
import Dashboard from '../pages/Dashboard';
import DashboardHome from '../pages/DashboardHome';
import EditProduct from '../pages/EditProduct';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import EmployeeDashboardHome from '../pages/EmployeeDashboardHome';
import EmployeeLogin from '../pages/EmployeeLogin';
import Events from '../pages/Events';
import EventsPayment from '../pages/EventsPayment';
import ForgotPassword from '../pages/ForgotPassword';
import Help from '../pages/Help';
import Inventory from '../pages/Inventory';
import InventoryReport from '../pages/InventoryReport';
import Login from '../pages/Login';
import Maintenance from '../pages/Maintenance';
import ProductRegistration from '../pages/ProductRegistration';
import ProductSelection from '../pages/ProductSelection';
import Profile from '../pages/Profile';
import PurchaseOrders from '../pages/PurchaseOrders';
import Receipt from '../pages/Receipt';
import Register from '../pages/Register';
import Reports from '../pages/Reports';
import ResetPassword from '../pages/ResetPassword';
import Restock from '../pages/Restock';
import Retail from '../pages/Retail';
import RetailPayment from '../pages/RetailPayment';
import SalesReport from '../pages/SalesReport';
import SpoilageReport from '../pages/SpoilageReport';
import UserManagement from '../pages/UserManagement';
import UserRegistration from '../pages/UserRegistration';
import VerifyOtp from '../pages/VerifyOtp';

export const RouteManager = () => {
  const location = useLocation();
  const { dispatch } = useAppContext();

  // Track current route for layout decisions
  useEffect(() => {
    dispatch({
      type: ActionTypes.SET_CURRENT_ROUTE,
      payload: location.pathname
    });
  }, [location.pathname, dispatch]);

  return (
    <Routes>
      {/* Public Routes - No Layout */}
      <Route path="/" element={
        <MinimalLayout>
          <Login />
        </MinimalLayout>
      } />
      <Route path="/register" element={
        <MinimalLayout>
          <Register />
        </MinimalLayout>
      } />
      <Route path="/employee-login" element={
        <MinimalLayout>
          <EmployeeLogin />
        </MinimalLayout>
      } />
      <Route path="/forgot-password" element={
        <MinimalLayout>
          <ForgotPassword />
        </MinimalLayout>
      } />
      <Route path="/reset-password" element={
        <MinimalLayout>
          <ResetPassword />
        </MinimalLayout>
      } />
      <Route path="/verify-otp" element={
        <MinimalLayout>
          <VerifyOtp />
        </MinimalLayout>
      } />

      {/* Admin Routes */}
      <Route path="/dashboard" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Dashboard">
            <DashboardHome />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      {/* Shared Routes - Accessible by both admin and employee */}
      <Route path="/retail" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <AdminLayout title="Retail">
            <Retail />
          </AdminLayout>
        </RoleProtectedRoute>
      } />
      
      <Route path="/events" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <AdminLayout title="Events">
            <Events />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/inventory" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <AdminLayout title="Inventory">
            <Inventory />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/help" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <AdminLayout title="Help">
            <Help />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/about" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <AdminLayout title="About">
            <About />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      {/* Admin-only Routes */}
      <Route path="/user-registration" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="User Registration">
            <UserRegistration />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/product-registration" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Product Registration">
            <ProductRegistration />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/reports" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Reports">
            <Reports />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/sales-report" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Sales Report">
            <SalesReport />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/inventory-report" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Inventory Report">
            <InventoryReport />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/spoilage-report" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Spoilage Report">
            <SpoilageReport />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/maintenance" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Maintenance">
            <Maintenance />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/user-management" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="User Management">
            <UserManagement />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/restock" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Restock">
            <Restock />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/purchase-orders" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Purchase Orders">
            <PurchaseOrders />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/create-purchase-order" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Create Purchase Order">
            <CreatePurchaseOrder />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/edit-product" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Edit Product">
            <EditProduct />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/backup" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Backup">
            <Backup />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/profile" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <AdminLayout title="Profile">
            <Profile />
          </AdminLayout>
        </RoleProtectedRoute>
      } />

      {/* Employee Dashboard Routes */}
      <Route path="/employee-dashboard/*" element={
        <RoleProtectedRoute allowedRoles={['employee']}>
          <EmployeeDashboard />
        </RoleProtectedRoute>
      } />

      {/* Transaction Routes - Minimal Layout (no sidebar) */}
      <Route path="/billing-retail" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <MinimalLayout showHeader={true}>
            <BillingRetail />
          </MinimalLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/billing-events" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <MinimalLayout showHeader={true}>
            <BillingEvents />
          </MinimalLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/product-selection" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <MinimalLayout showHeader={true}>
            <ProductSelection />
          </MinimalLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/retail-payment" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <MinimalLayout showHeader={true}>
            <RetailPayment />
          </MinimalLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/events-payment" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <MinimalLayout showHeader={true}>
            <EventsPayment />
          </MinimalLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/receipt" element={
        <RoleProtectedRoute allowedRoles={['admin', 'employee']}>
          <MinimalLayout showHeader={true}>
            <Receipt />
          </MinimalLayout>
        </RoleProtectedRoute>
      } />
    </Routes>
  );
};
