import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './pages/About'; // Assuming you have an About page
import BillingEvents from './pages/BillingEvents';
import BillingRetail from './pages/BillingRetail';
import Dashboard from './pages/Dashboard';
import EditProduct from './pages/EditProduct';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeLogin from './pages/EmployeeLogin';
import Events from './pages/Events';
import ForgotPassword from './pages/ForgotPassword';
import Help from './pages/Help';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import ProductRegistration from './pages/ProductRegistration';
import ProductSelection from './pages/ProductSelection';
import Receipt from './pages/Receipt';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Restock from './pages/Restock';
import Retail from './pages/Retail';
import RetailPayment from './pages/RetailPayment';
import UserRegistration from './pages/UserRegistration';
import VerifyOtp from './pages/VerifyOtp';

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/retail" element={<Retail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/product-registration" element={<ProductRegistration />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/billing-retail" element={<BillingRetail />} />
          <Route path="/product-selection" element={<ProductSelection />} />
          <Route path="/billing-events" element={<BillingEvents />} />
          <Route path="/retail-payment" element={<RetailPayment />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/restock" element={<Restock />} />
          <Route path="/edit-product" element={<EditProduct />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />}>
          <Route path="/employee-sidebar" element={<EmployeeSidebar />} />
          {/* Add other routes as needed */}
        </Routes>
      </Router>
    );
  }

export default App;
