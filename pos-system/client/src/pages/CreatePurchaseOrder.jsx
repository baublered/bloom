import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePurchaseOrder.css';

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [itemError, setItemError] = useState('');
    const [formError, setFormError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [networkError, setNetworkError] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const [poItems, setPoItems] = useState([]);
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');

    const [formData, setFormData] = useState({
        poNumber: '', // Will be auto-generated
        supplier: '',
        expectedDeliveryDate: '',
        notes: '',
        items: []
    });

    const fetchProducts = async () => {
        try {
            setError('');
            setNetworkError(false);
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000 // 10 second timeout
            };
            
            const res = await axios.get('/api/products', config);
            
            if (!res.data || !Array.isArray(res.data)) {
                throw new Error('Invalid data format received from server');
            }
            
            setProducts(res.data);
            
            if (res.data.length === 0) {
                setError('No products found. Please register products first before creating purchase orders.');
            }
            
        } catch (err) {
            console.error('Error fetching products:', err);
            
            let errorMessage = 'Failed to load products. ';
            
            if (err.code === 'ECONNABORTED') {
                errorMessage += 'Request timed out. The local server may be slow or unresponsive.';
                setNetworkError(true);
            } else if (err.response) {
                // Server responded with error status
                const status = err.response.status;
                switch (status) {
                    case 401:
                        errorMessage += 'Session expired. Please log in again.';
                        localStorage.removeItem('token');
                        navigate('/login');
                        return;
                    case 403:
                        errorMessage += 'You do not have permission to access this resource.';
                        break;
                    case 404:
                        errorMessage += 'Products endpoint not found. Please contact support.';
                        break;
                    case 500:
                        errorMessage += 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage += `Server error (${status}). Please try again.`;
                }
            } else if (err.request) {
                // Local server connection error
                errorMessage += 'Cannot connect to the local server. Please ensure the backend server is running on the correct port.';
                setNetworkError(true);
            } else {
                // Other error
                errorMessage += err.message || 'An unexpected error occurred.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // Generate a unique PO number when the component mounts
        const generatePoNumber = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const randomId = Math.random().toString(36).substr(2, 5).toUpperCase();
            return `PO-${year}${month}${day}-${randomId}`;
        };
        setFormData(prev => ({ ...prev, poNumber: generatePoNumber() }));
    }, []);

    const handleAddProduct = (product) => {
        try {
            setItemError('');
            
            // Comprehensive validation checks
            if (!product) {
                setItemError('Invalid product data. Please refresh the page and try again.');
                return;
            }
            
            if (!product._id) {
                setItemError('Product ID is missing. Please contact support.');
                return;
            }
            
            if (!product.productName?.trim()) {
                setItemError('Product name is missing. Please contact support.');
                return;
            }
            
            if (!product.supplierName?.trim()) {
                setItemError(`${product.productName} does not have a supplier assigned. Please update the product information first.`);
                return;
            }
            
            // Check if item already exists
            const existingItem = poItems.find(item => item.productId === product._id);
            if (existingItem) {
                setItemError(`${product.productName} is already in the purchase order. You can modify the quantity in the selected products section below.`);
                return;
            }
            
            // Validate supplier consistency for multi-product orders
            if (poItems.length > 0 && selectedSupplier && product.supplierName !== selectedSupplier) {
                setItemError(`All products in a purchase order must be from the same supplier. Current supplier: "${selectedSupplier}". This product is from: "${product.supplierName}". Please create separate purchase orders for different suppliers.`);
                return;
            }
            
            // Validate product category
            if (!product.productCategory?.trim()) {
                setItemError(`${product.productName} does not have a category assigned. Please update the product information first.`);
                return;
            }
            
            // Check if minimum threshold is set (for better inventory management)
            if (product.minimumThreshold === undefined || product.minimumThreshold === null) {
                setItemError(`${product.productName} does not have a minimum threshold set. Please update the product information first.`);
                return;
            }
            
            // Set supplier if this is the first product or if no supplier is selected
            if (poItems.length === 0 || !selectedSupplier) {
                setSelectedSupplier(product.supplierName);
            }

            const newItem = {
                productId: product._id,
                name: product.productName.trim(),
                quantity: 1, // Default quantity
                supplierName: product.supplierName.trim(),
                productCategory: product.productCategory,
                currentStock: product.quantity,
                minimumThreshold: product.minimumThreshold
            };
            
            setPoItems([...poItems, newItem]);
            
            // Clear form errors when successfully adding items
            setFormError('');
            if (validationErrors.items || validationErrors.supplier) {
                setValidationErrors(prev => ({
                    ...prev,
                    items: '',
                    supplier: ''
                }));
            }
            
        } catch (err) {
            console.error('Error adding product:', err);
            setItemError('Failed to add product. Please try again. If the problem persists, please refresh the page.');
        }
    };

    const handleRemoveItem = (productId) => {
        const updatedItems = poItems.filter(item => item.productId !== productId);
        setPoItems(updatedItems);
        
        // If no items left, clear the supplier
        if (updatedItems.length === 0) {
            setSelectedSupplier('');
        }
        
        // Clear validation errors when items are removed
        if (validationErrors.items || validationErrors.supplier) {
            setValidationErrors(prev => ({
                ...prev,
                items: updatedItems.length === 0 ? 'Please add at least one item to the purchase order.' : '',
                supplier: updatedItems.length === 0 ? 'Supplier is required. Please add products to automatically set the supplier.' : ''
            }));
        }
    };

    const handleDeliveryDateChange = (e) => {
        const newDate = e.target.value;
        setExpectedDeliveryDate(newDate);
        
        // Clear validation error when user starts fixing the date
        if (validationErrors.expectedDeliveryDate) {
            setValidationErrors(prev => ({
                ...prev,
                expectedDeliveryDate: ''
            }));
        }
        
        // Real-time validation for immediate feedback
        if (newDate) {
            const deliveryDate = new Date(newDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (deliveryDate < today) {
                setValidationErrors(prev => ({
                    ...prev,
                    expectedDeliveryDate: 'Expected delivery date cannot be in the past.'
                }));
            }
        }
    };

    const handleQuantityChange = (productId, quantity) => {
        try {
            setItemError('');
            
            // Input validation
            if (quantity === '' || quantity === null || quantity === undefined) {
                setItemError('Please enter a quantity.');
                return;
            }
            
            const numQuantity = parseInt(quantity, 10);
            
            if (isNaN(numQuantity)) {
                setItemError('Quantity must be a valid number.');
                return;
            }
            
            if (numQuantity < 1) {
                setItemError('Quantity must be at least 1.');
                return;
            }
            
            if (numQuantity > 100000) {
                setItemError('Quantity cannot exceed 100,000.');
                return;
            }
            
            if (!Number.isInteger(numQuantity)) {
                setItemError('Quantity must be a whole number.');
                return;
            }
            
            // Find the product to check available stock and provide helpful warnings
            const product = products.find(p => p._id === productId);
            if (!product) {
                setItemError('Product not found. Please refresh the page and try again.');
                return;
            }
            
            // Warning for very high quantities compared to current stock
            if (numQuantity > product.quantity + 1000 && product.quantity > 0) {
                setItemError(`Warning: Requesting ${numQuantity} units, but only ${product.quantity} currently in stock. This is a large order - please verify the quantity is correct.`);
            } else if (numQuantity > 1000) {
                setItemError(`Warning: This is a large quantity (${numQuantity} units). Please verify this is correct.`);
            }
            
            // Update the quantity
            setPoItems(poItems.map(item =>
                item.productId === productId ? { ...item, quantity: numQuantity } : item
            ));
            
            // Clear validation errors for quantities when user fixes them
            if (validationErrors.quantities || validationErrors.highQuantities) {
                setValidationErrors(prev => ({
                    ...prev,
                    quantities: '',
                    highQuantities: ''
                }));
            }
            
        } catch (err) {
            console.error('Error updating quantity:', err);
            setItemError('Failed to update quantity. Please try again.');
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Validate PO number
        if (!formData.poNumber?.trim()) {
            errors.poNumber = 'Purchase Order number is required.';
        } else if (formData.poNumber.trim().length < 5) {
            errors.poNumber = 'Purchase Order number must be at least 5 characters.';
        }
        
        // Validate selected products
        if (poItems.length === 0) {
            errors.items = 'Please add at least one item to the purchase order.';
        }
        
        // Validate supplier
        if (!selectedSupplier?.trim()) {
            errors.supplier = 'Supplier is required. Please add products to automatically set the supplier.';
        } else if (selectedSupplier.trim().length < 2) {
            errors.supplier = 'Supplier name must be at least 2 characters.';
        }
        
        // Validate expected delivery date (now required)
        if (!expectedDeliveryDate?.trim()) {
            errors.expectedDeliveryDate = 'Expected delivery date is required.';
        } else {
            const deliveryDate = new Date(expectedDeliveryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (isNaN(deliveryDate.getTime())) {
                errors.expectedDeliveryDate = 'Please enter a valid delivery date.';
            } else if (deliveryDate < today) {
                errors.expectedDeliveryDate = 'Expected delivery date cannot be in the past.';
            } else {
                // Check if date is too far in the future (more than 1 year)
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                if (deliveryDate > oneYearFromNow) {
                    errors.expectedDeliveryDate = 'Expected delivery date cannot be more than 1 year in the future.';
                }
            }
        }
        
        // Validate quantities for each item
        const invalidQuantities = poItems.filter(item => !item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity));
        if (invalidQuantities.length > 0) {
            errors.quantities = 'All items must have a valid quantity of at least 1.';
        }
        
        // Check for extremely high quantities (potential typo)
        const highQuantities = poItems.filter(item => item.quantity > 10000);
        if (highQuantities.length > 0) {
            errors.highQuantities = 'Some quantities seem unusually high. Please verify the quantities are correct.';
        }
        
        // Validate that all products still exist and haven't been deleted
        const missingProducts = poItems.filter(item => !products.find(p => p._id === item.productId));
        if (missingProducts.length > 0) {
            errors.missingProducts = 'Some selected products are no longer available. Please refresh and try again.';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreatePO = async () => {
        try {
            setFormError('');
            setValidationErrors({});
            setSaving(true);
            
            // Validate form
            if (!validateForm()) {
                setSaving(false);
                setFormError('Please fix the validation errors below.');
                return;
            }
            
            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                setFormError('Authentication token not found. Please log in again.');
                navigate('/login');
                return;
            }

            const finalItems = poItems.map(item => {
                const productDetails = products.find(p => p._id === item.productId);
                if (!productDetails) {
                    throw new Error(`Product details not found for ${item.name}`);
                }
                
                return {
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: productDetails?.price || 0,
                    totalPrice: item.quantity * (productDetails?.price || 0),
                };
            });

            const payload = {
                ...formData,
                items: finalItems,
                expectedDeliveryDate: expectedDeliveryDate || null,
                notes: notes?.trim() || '',
                supplier: selectedSupplier?.trim()
            };

            console.log('Creating PO with payload:', payload);

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 second timeout for creation
            };
            
            const response = await axios.post('/api/purchase-orders', payload, config);
            
            console.log('PO created successfully:', response.data);
            
            // Success - navigate to purchase orders list
            navigate('/purchase-orders', { 
                state: { 
                    message: `Purchase Order ${formData.poNumber} created successfully!`,
                    type: 'success'
                }
            });
            
        } catch (err) {
            console.error('Error creating purchase order:', err);
            
            let errorMessage = 'Failed to create purchase order. ';
            
            if (err.code === 'ECONNABORTED') {
                errorMessage += 'Request timed out. The local server may be slow or unresponsive.';
            } else if (err.response) {
                const status = err.response.status;
                const serverMessage = err.response.data?.message;
                
                switch (status) {
                    case 400:
                        errorMessage += serverMessage || 'Invalid data provided. Please check your inputs.';
                        
                        // Handle validation errors from server
                        if (err.response.data?.errors) {
                            const serverErrors = {};
                            err.response.data.errors.forEach(error => {
                                serverErrors[error.param || 'general'] = error.msg;
                            });
                            setValidationErrors(serverErrors);
                        }
                        break;
                    case 401:
                        errorMessage += 'Session expired. Please log in again.';
                        localStorage.removeItem('token');
                        navigate('/login');
                        return;
                    case 403:
                        errorMessage += 'You do not have permission to create purchase orders.';
                        break;
                    case 409:
                        errorMessage += serverMessage || 'Purchase order number already exists. Please try again.';
                        // Regenerate PO number
                        const generatePoNumber = () => {
                            const date = new Date();
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            const randomId = Math.random().toString(36).substr(2, 5).toUpperCase();
                            return `PO-${year}${month}${day}-${randomId}`;
                        };
                        setFormData(prev => ({ ...prev, poNumber: generatePoNumber() }));
                        break;
                    case 500:
                        errorMessage += 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage += serverMessage || `Server error (${status}). Please try again.`;
                }
            } else if (err.request) {
                errorMessage += 'Cannot connect to the local server. Please ensure the backend server is running.';
            } else {
                errorMessage += err.message || 'An unexpected error occurred.';
            }
            
            setFormError(errorMessage);
            
        } finally {
            setSaving(false);
        }
    };


    const retryFetchProducts = () => {
        setLoading(true);
        fetchProducts();
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
        const isLowStockOrOut = product.quantity <= product.minimumThreshold;
        return matchesSearch && isLowStockOrOut;
    });

    if (loading) return (
        <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-state">
            <div className="error-content">
                <h3>⚠️ Error Loading Products</h3>
                <p>{error}</p>
                {networkError && (
                    <div className="error-actions">
                        <button onClick={retryFetchProducts} className="retry-btn">
                            🔄 Retry
                        </button>
                        <button onClick={() => navigate(-1)} className="back-btn">
                            ← Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="create-purchase-order-container">
            <div className="create-po-header">
                <div className="header-left">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="back-btn"
                    >
                        ← Back
                    </button>
                    <h1>Create Purchase Order</h1>
                </div>
            </div>
            <div className="create-po-content">
                <div className="product-selection-section">
                    <h2>1. Select Products</h2>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="product-search-input"
                    />
                    
                    {/* Error Messages */}
                    {itemError && <div className="error-message item-error">{itemError}</div>}
                    {validationErrors.items && <div className="error-message">{validationErrors.items}</div>}
                    
                    <div className="product-list">
                        {filteredProducts.length === 0 ? (
                            <div className="no-products-message">
                                <p>
                                    {searchTerm 
                                        ? 'No low-stock products found matching your search.' 
                                        : 'No products need restocking at this time. All products are above their minimum threshold.'
                                    }
                                </p>
                                {!searchTerm && (
                                    <p className="note">Only products that are out of stock or below minimum threshold are shown here.</p>
                                )}
                            </div>
                        ) : (
                            filteredProducts.map((product) => {
                                const isLowStock = product.quantity <= product.minimumThreshold && product.quantity > 0;
                                const isOutOfStock = product.quantity <= 0;
                                
                                return (
                                    <div key={product._id} className={`product-item ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}`}>
                                        <div className="product-info">
                                            <div className="product-header">
                                                <span className="product-name">{product.productName}</span>
                                                {isOutOfStock && <span className="stock-badge out-of-stock-badge">OUT OF STOCK</span>}
                                                {isLowStock && <span className="stock-badge low-stock-badge">LOW STOCK</span>}
                                            </div>
                                            <div className="product-details">
                                                <span>Category: <strong>{product.productCategory}</strong></span>
                                                <span>Supplier: <strong>{product.supplierName}</strong></span>
                                            </div>
                                            <div className="product-stock">
                                                <span>Current Stock: <strong>{product.quantity}</strong></span>
                                                <span>Min. Threshold: <strong>{product.minimumThreshold}</strong></span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddProduct(product)}
                                            className="add-product-btn"
                                            disabled={poItems.some(item => item.productId === product._id)}
                                        >
                                            {poItems.some(item => item.productId === product._id) ? 'Added' : 'Add'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="po-details-section">
                    <h2>2. Purchase Order Details</h2>
                    <div className="po-form">
                        <div className="po-form-row">
                            <label>Purchase Order ID:</label>
                            <input
                                type="text"
                                value={formData.poNumber}
                                readOnly
                                className={`po-number-input ${validationErrors.poNumber ? 'error' : ''}`}
                                placeholder="Auto-generated"
                            />
                            {validationErrors.poNumber && <span className="field-error">{validationErrors.poNumber}</span>}
                        </div>
                        
                        <div className="po-form-row">
                            <label>Purchase Order by:</label>
                            <input
                                type="text"
                                value="Flowers by Edmar"
                                readOnly
                                className="po-company-input"
                            />
                        </div>
                        
                        <div className="po-form-row">
                            <label>Address:</label>
                            <input
                                type="text"
                                value="H31 New Public Market Antipolo City, Rizal"
                                readOnly
                                className="po-address-input"
                            />
                        </div>
                        
                        <div className="po-form-row">
                            <label>Supplier Name:</label>
                            <input
                                type="text"
                                value={selectedSupplier}
                                readOnly
                                className={`supplier-name-input ${validationErrors.supplier ? 'error' : ''}`}
                                placeholder="Select products to see supplier"
                            />
                            {validationErrors.supplier && <span className="field-error">{validationErrors.supplier}</span>}
                        </div>
                        
                        <div className="po-form-row">
                            <label>Expected Date of Delivery: <span className="required-asterisk">*</span></label>
                            <input
                                type="date"
                                value={expectedDeliveryDate}
                                onChange={handleDeliveryDateChange}
                                className={`po-date-input ${validationErrors.expectedDeliveryDate ? 'error' : ''}`}
                                min={new Date().toISOString().split('T')[0]} // Prevent past dates in date picker
                                required
                            />
                            {validationErrors.expectedDeliveryDate && <span className="field-error">{validationErrors.expectedDeliveryDate}</span>}
                        </div>
                        
                        <div className="po-form-row">
                            <label>Notes:</label>
                            <textarea
                                placeholder="Enter any additional notes or special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="po-notes-textarea"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <h3>Selected Products</h3>
                    <div className="po-items-list">
                        {poItems.length === 0 ? (
                            <div className="no-items-message">
                                <p>No products selected. Please select products from the list above.</p>
                            </div>
                        ) : (
                            <div className="po-items-table">
                                <div className="po-items-header">
                                    <span>Product Name</span>
                                    <span>Supplier</span>
                                    <span>Quantity</span>
                                    <span>Actions</span>
                                </div>
                                {poItems.map((item) => (
                                    <div key={item.productId} className="po-item">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-supplier">{item.supplierName}</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100000"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 1)}
                                            className={`po-item-quantity-input ${validationErrors.quantities || validationErrors.highQuantities ? 'error' : ''}`}
                                            onBlur={(e) => {
                                                // Ensure minimum value on blur
                                                if (!e.target.value || parseInt(e.target.value) < 1) {
                                                    handleQuantityChange(item.productId, 1);
                                                }
                                            }}
                                        />
                                        <button 
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className="remove-item-btn"
                                            title={`Remove ${item.name} from purchase order`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {formError && <div className="error-message form-error">{formError}</div>}
                    {validationErrors.quantities && <div className="error-message">{validationErrors.quantities}</div>}
                    {validationErrors.highQuantities && <div className="error-message warning">{validationErrors.highQuantities}</div>}
                    {validationErrors.missingProducts && <div className="error-message">{validationErrors.missingProducts}</div>}

                    {poItems.length > 0 && (
                        <button onClick={handleCreatePO} className="create-po-btn" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="loading-spinner-small"></span>
                                    Creating...
                                </>
                            ) : (
                                'Create Purchase Order'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
