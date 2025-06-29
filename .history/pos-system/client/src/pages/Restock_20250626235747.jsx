import axios from 'axios'; // Import axios
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Restock.css';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';

const Restock = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [restockQuantities, setRestockQuantities] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- UPDATED: Function to fetch real product data ---
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error('API Error:', err);
            setError('Failed to load products. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products when the component first loads
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleQuantityChange = (productId, value) => {
        const quantity = parseInt(value, 10);
        setRestockQuantities(prev => ({
            ...prev,
            [productId]: isNaN(quantity) || quantity < 0 ? '' : quantity,
        }));
    };
    
    const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveChanges = () => {
        const hasChanges = Object.values(restockQuantities).some(qty => qty > 0);
        if (hasChanges) {
            setIsModalOpen(true);
        } else {
            alert("Please enter a quantity to restock.");
        }
    };

    // --- UPDATED: This now makes a real API call ---
    const confirmSaveChanges = async () => {
        try {
            const response = await axios.post('/api/products/restock', restockQuantities);
            if (response.data.success) {
                alert("Products restocked successfully!");
                fetchProducts(); // Refresh the product list to show new quantities
            }
        } catch (err) {
            console.error("Error saving changes:", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsModalOpen(false);
            setRestockQuantities({}); // Reset the input fields
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="restock-layout">
            <Sidebar />
            <main className="restock-main-content">
                <header className="restock-header">
                    <h1>Restock</h1>
                    <div className="header-actions">
                        <span className="notification-bell">🔔</span>
                        <UserProfile />
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
                                    <th>ID</th><th>Name</th><th>Category</th><th>Current Qty.</th><th>Price</th><th>Supplier</th><th>Lifespan</th><th>Add Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>{product._id.slice(-6).toUpperCase()}</td>
                                        <td>{product.productName}</td>
                                        <td>{product.productCategory}</td>
                                        <td>{product.quantity}</td>
                                        <td>P{product.price}</td>
                                        <td>{product.supplierName}</td>
                                        <td>{product.lifespanInDays} days</td>
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
