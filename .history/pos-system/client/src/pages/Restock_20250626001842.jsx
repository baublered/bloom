import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Restock.css';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';

const Restock = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // State to track the quantities to be restocked for each product
    const [restockQuantities, setRestockQuantities] = useState({});
    // State for the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch products and set mock data
    useEffect(() => {
        // In the future, this will be an API call, e.g., axios.get('/api/products')
        const mockProducts = [
            { _id: '6845a48b6dd5772b2d194b01', productName: 'Rose', productCategory: 'Flower', quantity: 20, price: 100, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day', status: 'good' },
            { _id: '6845a48b6dd5772b2d194b02', productName: 'Tulip', productCategory: 'Flower', quantity: 5, price: 120, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day', status: 'low' },
            { _id: '6845a48b6dd5772b2d194b03', productName: 'Carnation', productCategory: 'Flower', quantity: 15, price: 80, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day', status: 'good' },
            { _id: '6845a48b6dd5772b2d194b04', productName: 'Sunflower', productCategory: 'Flower', quantity: 30, price: 150, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day', status: 'good' },
        ];
        setProducts(mockProducts);
    }, []);

    const handleQuantityChange = (productId, value) => {
        const quantity = parseInt(value, 10);
        setRestockQuantities(prev => ({
            ...prev,
            [productId]: isNaN(quantity) ? '' : quantity,
        }));
    };
    
    // Filter products based on search term
    const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveChanges = () => {
        // Check if there are any changes to save before opening the modal
        if (Object.keys(restockQuantities).length > 0) {
            setIsModalOpen(true);
        } else {
            alert("No changes to save.");
        }
    };

    const confirmSaveChanges = () => {
        // TODO: Add API call logic here to send `restockQuantities` to the backend.
        console.log("Saving changes:", restockQuantities);
        alert("Changes have been saved!");
        setIsModalOpen(false);
        setRestockQuantities({}); // Reset changes after saving
    };


    return (
        <div className="restock-layout">
            <Sidebar />
            <main className="restock-main-content">
                <header className="restock-header">
                    <h1>Restock</h1>
                    <div className="header-actions">
                        <span className="notification-bell">🔔</span>
                        <div className="user-profile">
                        <UserProfile />
                    </div>
                    </div>
                </header>

                <div className="restock-table-card">
                    <div className="table-card-header">
                        <h2>Products</h2>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="restock-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Qty.</th>
                                    <th>Price</th>
                                    <th>Supplier</th>
                                    <th>Date Received</th>
                                    <th>Lifespan</th>
                                    <th>Status</th>
                                    <th>Configure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>{product._id.slice(-3).toUpperCase()}</td>
                                        <td>{product.productName}</td>
                                        <td>{product.productCategory}</td>
                                        <td>{product.quantity}</td>
                                        <td>P{product.price}</td>
                                        <td>{product.supplierName}</td>
                                        <td>{new Date(product.dateReceived).toLocaleDateString()}</td>
                                        <td>{product.lifespan}</td>
                                        <td>
                                            <span className={`status-dot ${product.quantity > 10 ? 'good' : 'low'}`}></span>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="restock-input"
                                                placeholder="0"
                                                value={restockQuantities[product._id] || ''}
                                                onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="table-card-footer">
                        <button className="save-changes-btn" onClick={handleSaveChanges}>
                            SAVE CHANGES
                        </button>
                    </div>
                </div>
            </main>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal">
                        <p>Are you sure you want to save changes?</p>
                        <div className="modal-actions">
                            <button className="modal-btn no" onClick={() => setIsModalOpen(false)}>NO</button>
                            <button className="modal-btn yes" onClick={confirmSaveChanges}>YES</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Restock;

