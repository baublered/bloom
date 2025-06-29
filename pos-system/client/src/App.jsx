import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './pages/About';
import Backup from './pages/Backup';
import BillingEvents from './pages/BillingEvents';
import BillingRetail from './pages/BillingRetail';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import EditProduct from './pages/EditProduct';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDashboardHome from './pages/EmployeeDashboardHome';
import EmployeeLogin from './pages/EmployeeLogin';
import Events from './pages/Events';
import EventsPayment from './pages/EventsPayment';
import ForgotPassword from './pages/ForgotPassword';
import Help from './pages/Help';
import Inventory from './pages/Inventory';
import InventoryReport from './pages/InventoryReport';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import ProductRegistration from './pages/ProductRegistration';
import ProductSelection from './pages/ProductSelection';
import Profile from './pages/Profile';
import Receipt from './pages/Receipt';
import Register from './pages/Register';
import Reports from './pages/Reports';
import ResetPassword from './pages/ResetPassword';
import Restock from './pages/Restock';
import Retail from './pages/Retail';
import RetailPayment from './pages/RetailPayment';
import SalesReport from './pages/SalesReport';
import SpoilageReport from './pages/SpoilageReport';
import UserProfile from './pages/UserProfile';
import UserRegistration from './pages/UserRegistration';
import VerifyOtp from './pages/VerifyOtp';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/retail" element={<Retail />} />
          <Route path="/events" element={<Events />} />
          
          {/* Admin-only routes - restricted for employees */}
          <Route path="/user-registration" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <UserRegistration />
            </RoleProtectedRoute>
          } />
          <Route path="/product-registration" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <ProductRegistration />
            </RoleProtectedRoute>
          } />
          <Route path="/reports" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <Reports />
            </RoleProtectedRoute>
          } />
          <Route path="/sales-report" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <SalesReport />
            </RoleProtectedRoute>
          } />
          <Route path="/inventory-report" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <InventoryReport />
            </RoleProtectedRoute>
          } />
          <Route path="/spoilage-report" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <SpoilageReport />
            </RoleProtectedRoute>
          } />
          <Route path="/backup" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <Backup />
            </RoleProtectedRoute>
          } />
          
          {/* Routes accessible to all authenticated users */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/billing-retail" element={<BillingRetail />} />
          <Route path="/product-selection" element={<ProductSelection />} />
          <Route path="/billing-events" element={<BillingEvents />} />
          <Route path="/retail-payment" element={<RetailPayment />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/employee-dashboard/*" element={<EmployeeDashboard />} />
          <Route path="/events-payment" element={<EventsPayment />} />
          
          {/* Admin-only maintenance routes - restricted for employees */}
          <Route path="/maintenance" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <Maintenance />
            </RoleProtectedRoute>
          } />
          <Route path="/restock" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <Restock />
            </RoleProtectedRoute>
          } />
          <Route path="/edit-product" element={
            <RoleProtectedRoute restrictedForRoles={['employee']}>
              <EditProduct />
            </RoleProtectedRoute>
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard-home" element={<DashboardHome />} />
        </Routes>
      </Router>
    );
}

export default App;
