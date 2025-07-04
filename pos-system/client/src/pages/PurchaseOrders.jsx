import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PurchaseOrders.css';

const PurchaseOrders = () => {
    const navigate = useNavigate();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [receivingPO, setReceivingPO] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPOForDetails, setSelectedPOForDetails] = useState(null);

    const fetchPurchaseOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const res = await axios.get('/api/purchase-orders', config);
            setPurchaseOrders(res.data.purchaseOrders || res.data);
        } catch (err) {
            console.error('Error fetching purchase orders:', err);
            setError('Failed to load purchase orders. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (poId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const res = await axios.put(`/api/purchase-orders/${poId}/status`, {
                status: newStatus
            }, config);

            if (res.data.success || res.status === 200) {
                // Update the PO status in the local state
                setPurchaseOrders(prev => 
                    prev.map(po => 
                        po._id === poId 
                            ? { ...po, status: newStatus }
                            : po
                    )
                );
            }
        } catch (err) {
            console.error('Error updating purchase order status:', err);
            alert('Failed to update purchase order status. Please try again.');
        }
    };

    const handleReceivePO = async (po) => {
        setSelectedPO(po);
        setShowReceiveModal(true);
    };

    const handleViewDetails = (po) => {
        setSelectedPOForDetails(po);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedPOForDetails(null);
    };

    const confirmReceivePO = async () => {
        if (!selectedPO) return;

        setReceivingPO(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            // Prepare received items with the full quantities from the PO
            const receivedItems = selectedPO.items.map(item => ({
                productId: item.productId._id || item.productId,
                receivedQuantity: item.quantity
            }));

            console.log('Sending receive request:', {
                poId: selectedPO._id,
                receivedItems: receivedItems
            });

            const res = await axios.post(`/api/purchase-orders/${selectedPO._id}/receive`, {
                receivedItems
            }, config);

            if (res.data.success) {
                // Update the PO status in the local state
                setPurchaseOrders(prev => 
                    prev.map(po => 
                        po._id === selectedPO._id 
                            ? { ...po, status: 'Received' }
                            : po
                    )
                );
                
                setShowReceiveModal(false);
                setSelectedPO(null);
                
                // Show success message
                alert('Purchase order received successfully! Inventory has been updated.');
            }
        } catch (err) {
            console.error('Error receiving purchase order:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response ? {
                    status: err.response.status,
                    data: err.response.data
                } : 'No response'
            });
            
            let errorMessage = 'Failed to receive purchase order. Please try again.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            
            alert(errorMessage);
        } finally {
            setReceivingPO(false);
        }
    };

    const cancelReceivePO = () => {
        setShowReceiveModal(false);
        setSelectedPO(null);
    };

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    if (loading) return <div className="loading-state">Loading purchase orders...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="purchase-orders-container">
            <div className="purchase-orders-header">
                <div className="header-left">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="back-btn"
                    >
                        ← Back
                    </button>
                    <h1>Purchase Orders</h1>
                </div>
                <button 
                    onClick={() => navigate('/create-purchase-order')} 
                    className="create-po-btn"
                >
                    Create New PO
                </button>
            </div>

            <div className="purchase-orders-content">
                {purchaseOrders.length === 0 ? (
                    <div className="no-pos-message">
                        <p>No purchase orders found.</p>
                        <button 
                            onClick={() => navigate('/create-purchase-order')} 
                            className="create-first-po-btn"
                        >
                            Create Your First Purchase Order
                        </button>
                    </div>
                ) : (
                    <div className="pos-table-container">
                        <table className="pos-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Supplier</th>
                                    <th>Status</th>
                                    <th>Order Date</th>
                                    <th>Expected Delivery</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.map((po) => (
                                    <tr key={po._id}>
                                        <td>{po.poNumber}</td>
                                        <td>{po.supplier}</td>
                                        <td>
                                            <select 
                                                className={`status-dropdown status-${po.status.toLowerCase().replace(' ', '-')}`}
                                                value={po.status}
                                                onChange={(e) => handleStatusChange(po._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Received">Received</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                                        <td>
                                            {po.expectedDeliveryDate 
                                                ? new Date(po.expectedDeliveryDate).toLocaleDateString() 
                                                : '-'
                                            }
                                        </td>
                                        <td>₱{po.totalAmount.toFixed(2)}</td>
                                        <td>
                                            <button 
                                                className="view-po-btn"
                                                onClick={() => handleViewDetails(po)}
                                            >
                                                View Details
                                            </button>
                                            {po.status === 'Pending' && (
                                                <button 
                                                    className="receive-po-btn"
                                                    onClick={() => handleReceivePO(po)}
                                                >
                                                    Receive
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Receive Purchase Order Modal */}
            {showReceiveModal && selectedPO && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Receive Purchase Order</h2>
                        <p>Are you sure you want to receive Purchase Order <strong>{selectedPO.poNumber}</strong>?</p>
                        
                        <div className="po-details">
                            <p><strong>Supplier:</strong> {selectedPO.supplier}</p>
                            <p><strong>Total Amount:</strong> ₱{selectedPO.totalAmount.toFixed(2)}</p>
                            <p><strong>Items:</strong></p>
                            <ul>
                                {selectedPO.items.map((item, index) => (
                                    <li key={index}>
                                        {(item.productId && item.productId.productName) || item.productName || 'Unknown Product'} - Quantity: {item.quantity}
                                    </li>
                                ))}
                            </ul>
                            <p><em>This will restock all items in the inventory.</em></p>
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="confirm-receive-btn"
                                onClick={confirmReceivePO}
                                disabled={receivingPO}
                            >
                                {receivingPO ? 'Receiving...' : 'Confirm Receive'}
                            </button>
                            <button 
                                className="cancel-receive-btn"
                                onClick={cancelReceivePO}
                                disabled={receivingPO}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Order Details Modal */}
            {showDetailsModal && selectedPOForDetails && (
                <div className="modal-overlay">
                    <div className="modal-content details-modal">
                        <h2>Purchase Order Details</h2>
                        
                        <div className="po-details-grid">
                            <div className="po-info-section">
                                <h3>Order Information</h3>
                                <div className="info-row">
                                    <span className="info-label">PO Number:</span>
                                    <span className="info-value">{selectedPOForDetails.poNumber}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Supplier:</span>
                                    <span className="info-value">{selectedPOForDetails.supplier}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Status:</span>
                                    <span className={`info-value status-badge status-${selectedPOForDetails.status.toLowerCase().replace(' ', '-')}`}>
                                        {selectedPOForDetails.status}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Order Date:</span>
                                    <span className="info-value">{new Date(selectedPOForDetails.orderDate).toLocaleDateString()}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Expected Delivery:</span>
                                    <span className="info-value">
                                        {selectedPOForDetails.expectedDeliveryDate 
                                            ? new Date(selectedPOForDetails.expectedDeliveryDate).toLocaleDateString()
                                            : 'Not specified'
                                        }
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Total Amount:</span>
                                    <span className="info-value total-amount">₱{selectedPOForDetails.totalAmount.toFixed(2)}</span>
                                </div>
                                {selectedPOForDetails.notes && (
                                    <div className="info-row">
                                        <span className="info-label">Notes:</span>
                                        <span className="info-value">{selectedPOForDetails.notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="po-items-section">
                                <h3>Order Items</h3>
                                <div className="items-table">
                                    <div className="items-header">
                                        <span>Product Name</span>
                                        <span>Quantity</span>
                                        <span>Unit Price</span>
                                        <span>Total Price</span>
                                    </div>
                                    {selectedPOForDetails.items.map((item, index) => (
                                        <div key={index} className="items-row">
                                            <span className="item-name" data-label="Product Name">
                                                {(item.productId && item.productId.productName) || item.productName || 'Unknown Product'}
                                            </span>
                                            <span className="item-quantity" data-label="Quantity">{item.quantity}</span>
                                            <span className="item-price" data-label="Unit Price">₱{(item.unitPrice || 0).toFixed(2)}</span>
                                            <span className="item-total" data-label="Total Price">₱{(item.totalPrice || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="close-details-btn"
                                onClick={closeDetailsModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
