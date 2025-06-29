import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProduct.css'; // We'll create this CSS file
import Sidebar from './Sidebar'; // Assuming your Sidebar component is in the same folder

const EditProduct = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // State to track which row is currently being edited
    const [editingId, setEditingId] = useState(null); 
    // State to hold the temporary data for the row being edited
    const [editedRowData, setEditedRowData] = useState(null);
    // State for the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch products (using mock data for now)
    useEffect(() => {
        const mockProducts = [
            { _id: '6845a48b6dd5772b2d194b01', productName: 'Rose', productCategory: 'Flower', quantity: 20, price: 100, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day' },
            { _id: '6845a48b6dd5772b2d194b02', productName: 'Tulip', productCategory: 'Flower', quantity: 5, price: 120, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day' },
            { _id: '6845a48b6dd5772b2d194b03', productName: 'Carnation', productCategory: 'Flower', quantity: 15, price: 80, supplierName: 'Dangwa Corp.', dateReceived: '2024-10-26T00:00:00.000Z', lifespan: '1 day' },
        ];
        setProducts(mockProducts);
    }, []);
    
    // Filter products based on search term
    const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setEditedRowData({ ...product }); // Copy product data to editable state
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
        // Show modal only if a row is in edit mode
        if (editingId) {
            setIsModalOpen(true);
        } else {
            alert("No product is being edited.");
        }
    };

    const confirmSaveChanges = () => {
        // TODO: Add API call logic here to send `editedRowData` to the backend.
        console.log("Saving changes for product:", editedRowData);

        // Update the main products list with the edited data
        setProducts(prevProducts => 
            prevProducts.map(p => (p._id === editingId ? editedRowData : p))
        );
        
        alert("Changes have been saved!");
        setIsModalOpen(false);
        setEditingId(null); // Exit edit mode
        setEditedRowData(null);
    };

    return (
        <div className="edit-product-layout">
            <Sidebar />
            <main className="edit-product-main-content">
                <header className="edit-product-header">
                    <h1>Edit</h1>
                    <div className="header-actions">
                        <span className="notification-bell">🔔</span>
                        <div className="user-profile-button">
                            <span className="user-icon">👤</span>
                            <span>User Profile</span>
                            <span className="dropdown-arrow">▼</span>
                        </div>
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
                                    <th>ID</th><th>Name</th><th>Category</th><th>Qty.</th><th>Price</th><th>Supplier</th><th>Date Received</th><th>Lifespan</th><th>Status</th><th>Configure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product._id} className={editingId === product._id ? 'editing' : ''}>
                                        <td>{product._id.slice(-3).toUpperCase()}</td>
                                        <td>{editingId === product._id ? <input type="text" name="productName" value={editedRowData.productName} onChange={handleInputChange} /> : product.productName}</td>
                                        <td>{editingId === product._id ? <input type="text" name="productCategory" value={editedRowData.productCategory} onChange={handleInputChange} /> : product.productCategory}</td>
                                        <td>{editingId === product._id ? <input type="number" name="quantity" value={editedRowData.quantity} onChange={handleInputChange} /> : product.quantity}</td>
                                        <td>{editingId === product._id ? <input type="number" name="price" value={editedRowData.price} onChange={handleInputChange} /> : `P${product.price}`}</td>
                                        <td>{editingId === product._id ? <input type="text" name="supplierName" value={editedRowData.supplierName} onChange={handleInputChange} /> : product.supplierName}</td>
                                        <td>{new Date(product.dateReceived).toLocaleDateString()}</td>
                                        <td>{editingId === product._id ? <input type="text" name="lifespan" value={editedRowData.lifespan} onChange={handleInputChange} /> : product.lifespan}</td>
                                        <td><span className={`status-dot ${product.quantity > 10 ? 'good' : 'low'}`}></span></td>
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
