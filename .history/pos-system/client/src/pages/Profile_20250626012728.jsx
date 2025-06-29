import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- NEW: State for the confirmation modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No authentication token found. Please log in.");
                }
                const response = await axios.get('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email || '',
                    phone: response.data.phone || ''
                });
            } catch (err) {
                setError('Failed to fetch profile data. You may need to log in again.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // This function now just opens the confirmation modal
    const handleSaveClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    // This function contains the actual API call and is triggered by the modal
    const confirmSaveChanges = async () => {
        setIsModalOpen(false); // Close the modal first
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('/api/auth/me', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.data.success) {
                setUser(prev => ({...prev, ...response.data.user}));
                setIsEditing(false); // Exit edit mode on success
            }
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        }
    };

    if (loading) return <div className="profile-page-layout"><p className="status-message">Loading profile...</p></div>;
    if (error) return <div className="profile-page-layout"><p className="status-message error">{error}</p></div>;
    if (!user) return <div className="profile-page-layout"><p className="status-message">No user data found.</p></div>;

    return (
        <div className="profile-page-layout">
            <header className="profile-page-header">
                <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
                <h1>Profile</h1>
            </header>
            <main className="profile-content">
                <div className="profile-card-left">
                    <div className="profile-avatar">
                         <img src={`https://placehold.co/150x150/535978/FFFFFF?text=${user.name?.charAt(0).toUpperCase() || 'U'}`} alt="User Avatar" />
                    </div>
                    <h2>{user.name}</h2>
                    {/* Add a change picture button if needed */}
                    <button className="change-picture-btn">Change Picture</button>
                </div>
                <div className="profile-card-right">
                    <div className="card-header">
                        <h3>Your Information</h3>
                        {!isEditing && (
                             <button className="edit-button" onClick={() => setIsEditing(true)}>
                                ✎ Edit
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSaveClick} className="profile-form">
                        <div className="input-group">
                            <label>Full Name:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="input-group">
                            <label>Email Address:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="input-group">
                            <label>Username:</label>
                            <input type="text" value={user.employeeId || ''} disabled />
                        </div>
                         <div className="input-group">
                            <label>Phone Number:</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="input-group">
                            <label>Role:</label>
                            <input type="text" value={user.role || ''} disabled />
                        </div>
                        {isEditing && (
                            <div className="form-actions">
                                <button type="submit" className="save-button">Save Changes</button>
                                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        )}
                    </form>
                </div>
            </main>

            {/* --- NEW: Confirmation Modal --- */}
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

export default Profile;
