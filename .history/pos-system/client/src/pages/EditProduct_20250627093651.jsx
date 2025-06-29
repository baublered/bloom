import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProduct.css';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';

const EditProduct = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null); 
    const [editedRowData, setEditedRowData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    
    const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setEditedRowData({ ...product });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedRowData(null);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRowData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChangesClick = () => {
        if (editingId) {
            setIsModalOpen(true);
        } else {
            alert("No product is being edited.");
        }
    };

    const confirmSaveChanges = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            // The data we send excludes quantity, as the backend will ignore it
            const response = await axios.put(`/api/products/${editingId}`, editedRowData, config);

            if (response.data.success) {
                alert("Changes have been saved!");
                fetchProducts(); // Refresh the data
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save changes.");
        } finally {
            setIsModalOpen(false);
            setEditingId(null);
            setEditedRowData(null);
        }
    };

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="edit-product-layout">
            <Sidebar />
            <main className="edit-product-main-content">
                <header className="edit-product-header">
                    <h1>Edit</h1>
                    <div className="header-actions">
                        <span className="notification-bell">🔔</span>
                        <UserProfile />
                    </div>
                </header>
                <div className="edit-product-table-card">
                    <div className="table-card-header">
                        <h2>Products</h2>
                        <div className="search-container">
                            <input type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="edit-product-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Name</th><th>Category</th><th>Qty.</th><th>Price</th><th>Supplier</th><th>Lifespan (Days)</th><th>Configure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product._id} className={editingId === product._id ? 'editing' : ''}>
                                        <td>{product._id.slice(-6).toUpperCase()}</td>
                                        <td>{editingId === product._id ? <input type="text" name="productName" value={editedRowData.productName} onChange={handleInputChange} /> : product.productName}</td>
                                        <td>{editingId === product._id ? <input type="text" name="productCategory" value={editedRowData.productCategory} onChange={handleInputChange} /> : product.productCategory}</td>
                                        <td>{product.quantity}</td>
                                        <td>{editingId === product._id ? <input type="number" name="price" value={editedRowData.price} onChange={handleInputChange} /> : `P${product.price}`}</td>
                                        <td>{editingId === product._id ? <input type="text" name="supplierName" value={editedRowData.supplierName} onChange={handleInputChange} /> : product.supplierName}</td>
                                        <td>{editingId === product._id ? <input type="number" name="lifespanInDays" value={editedRowData.lifespanInDays} onChange={handleInputChange} /> : product.lifespanInDays}</td>
                                        <td>
                                            {editingId === product._id ? (
                                                <button className="cancel-btn" onClick={handleCancelEdit}>✖</button>
                                            ) : (
                                                <button className="edit-btn" onClick={() => handleEditClick(product)}>✎</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-card-footer">
                        <button className="save-changes-btn" onClick={handleSaveChangesClick}>SAVE CHANGES</button>
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

export default EditProduct;
