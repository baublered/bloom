import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Restock_new.css';
import UserProfile from './UserProfile';
import { useRoleBasedNavigation } from '../utils/navigation';

const Restock = () => {
    const navigate = useNavigate();
    const { isEmployeeDashboard } = useRoleBasedNavigation();

    return (
        <main className="restock-container">
            <header className="restock-header">
                <div className="header-left">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="back-btn"
                    >
                        ← Back
                    </button>
                    <h1>Restock</h1>
                </div>
                <div className="header-actions">
                    <UserProfile />
                </div>
            </header>

            <div className="restock-content">
                <div className="restock-info-card">
                    <h2>Purchase Order-Based Restocking</h2>
                    <p>
                        To properly track flower freshness and inventory batches, 
                        we now use a Purchase Order system for all restocking operations.
                    </p>
                    
                    <div className="restock-workflow">
                        <h3>How to Restock:</h3>
                        <ol>
                            <li>Create a Purchase Order by selecting items to restock</li>
                            <li>Set expected delivery date and quantities</li>
                            <li>When items arrive, mark the PO as "Received"</li>
                            <li>System automatically creates inventory batches with correct expiry dates</li>
                        </ol>
                    </div>

                    <div className="restock-actions">
                        <button 
                            className="primary-btn"
                            onClick={() => navigate('/create-purchase-order')}
                        >
                            Create Purchase Order
                        </button>
                        <button 
                            className="secondary-btn"
                            onClick={() => navigate('/purchase-orders')}
                        >
                            View Purchase Orders
                        </button>
                    </div>
                </div>

                <div className="benefits-card">
                    <h3>Benefits of PO-Based Restocking:</h3>
                    <ul>
                        <li>✅ Accurate tracking of each flower batch's freshness</li>
                        <li>✅ Automatic FIFO (First In, First Out) sales</li>
                        <li>✅ Prevents mixing old and new stock</li>
                        <li>✅ Better supplier relationship management</li>
                        <li>✅ Detailed inventory history</li>
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default Restock;
