import { Route, Routes } from 'react-router-dom';
import './Dashboard.css';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeDashboardHome from './EmployeeDashboardHome';
import Retail from './Retail';
import Events from './Events';
import Inventory from './Inventory';
import Help from './Help';
import About from './About';
import BillingRetail from './BillingRetail';
import BillingEvents from './BillingEvents';
import ProductSelection from './ProductSelection';
import RetailPayment from './RetailPayment';
import EventsPayment from './EventsPayment';
import Receipt from './Receipt';
import UserProfile from './UserProfile';
import Profile from './Profile';

const EmployeeDashboard = () => {
  return (
    <div className="dashboard-container">
        <EmployeeSidebar />
        <main className="dashboard-main">
            <header className="dashboard-header">
                <div className="header-left">
                    {/* This will be populated by individual pages if needed */}
                </div>
                <div className="header-right">
                    <UserProfile />
                </div>
            </header>
            <Routes>
                <Route path="/" element={<EmployeeDashboardHome />} />
                <Route path="/retail" element={<Retail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/help" element={<Help />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Employee-accessible transaction routes */}
                <Route path="/billing-retail" element={<BillingRetail />} />
                <Route path="/billing-events" element={<BillingEvents />} />
                <Route path="/product-selection" element={<ProductSelection />} />
                <Route path="/retail-payment" element={<RetailPayment />} />
                <Route path="/events-payment" element={<EventsPayment />} />
                <Route path="/receipt" element={<Receipt />} />
            </Routes>
        </main>
    </div>
  );
};

export default EmployeeDashboard;
