import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import BillingEvents from './pages/BillingEvents';
import BillingRetail from './pages/BillingRetail';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import ProductRegistration from './pages/ProductRegistration';
import ProductSelection from './pages/ProductSelection';
import Register from './pages/Register';
import Retail from './pages/Retail';
import RetailPayment from './pages/RetailPayment';
import UserRegistration from './pages/UserRegistration';

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
          {/* Add other routes as needed */}
        </Routes>
      </Router>
    );
  }

export default App;
