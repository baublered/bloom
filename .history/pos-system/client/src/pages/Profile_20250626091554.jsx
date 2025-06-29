import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [passwordToVerify, setPasswordToVerify] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No authentication token found.");
                const decodedToken = jwtDecode(token);
                
                const response = await axios.get('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser({...response.data, role: decodedToken.user.role});
                setFormData({ name: response.data.name, email: response.data.email || '', phone: response.data.phone || '' });
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const confirmSaveChanges = async () => {
        setIsModalOpen(false);
        try {
            const token = localStorage.getItem('token');
            const updateData = { name: formData.name, phone: formData.phone };

            const response = await axios.put('/api/auth/me', updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.data.success) {
                setUser(prev => ({...prev, ...response.data.user}));
                setIsEditing(false);
            }
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    // --- UPDATED: This function now navigates to a new page ---
    const handleVerifyPasswordForEmailChange = async () => {
        try {
            await axios.post('/api/auth/login', { 
                employeeId: user.employeeId, 
                password: passwordToVerify,
                role: user.role
            });
            // On successful verification, navigate to the dedicated Change Email page
            navigate('/change-email', { state: { currentEmail: user.email } });
        } catch (err) {
            alert("Incorrect password. Please try again.");
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
                    <div className="profile-avatar"><img src={`https://placehold.co/150x150/535978/FFFFFF?text=${user.name?.charAt(0).toUpperCase() || 'U'}`} alt="User Avatar" /></div>
                    <h2>{user.name}</h2>
                    <button className="change-picture-btn">Change Picture</button>
                </div>
                <div className="profile-card-right">
                    <div className="card-header">
                        <h3>Your Information</h3>
                        {!isEditing && <button className="edit-button" onClick={() => setIsEditing(true)}>✎ Edit</button>}
                    </div>
                    <form onSubmit={handleSaveClick} className="profile-form">
                        <div className="input-group"><label>Full Name:</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} /></div>
                        
                        <div className="input-group">
                            <label>Email Address:</label>
                            <div className="input-with-icon">
                                <input type="email" name="email" value={formData.email} disabled />
                                {isEditing && (
                                    <button type="button" className="inline-edit-btn" title="Verify to change email" onClick={() => setIsEmailModalOpen(true)}>✎</button>
                                )}
                            </div>
                        </div>

                        <div className="input-group"><label>Username:</label><input type="text" value={user.employeeId || ''} disabled /></div>
                        <div className="input-group"><label>Phone Number:</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} /></div>
                        <div className="input-group"><label>Role:</label><input type="text" value={user.role || ''} disabled /></div>
                        
                        {isEditing && (
                            <div className="form-actions">
                                <button type="submit" className="save-button">Save Changes</button>
                                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        )}
                    </form>
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
            
            {isEmailModalOpen && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal">
                        <h3>Confirm Identity</h3>
                        <p>To change your email, please enter your current password.</p>
                        <input type="password" className="password-verify-input" value={passwordToVerify} onChange={(e) => setPasswordToVerify(e.target.value)} placeholder="Enter password" />
                        <div className="modal-actions">
                            <button className="modal-btn no" onClick={() => setIsEmailModalOpen(false)}>Cancel</button>
                            <button className="modal-btn yes" onClick={handleVerifyPasswordForEmailChange}>Verify</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
