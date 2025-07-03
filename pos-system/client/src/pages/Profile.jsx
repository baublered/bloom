import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { useRoleBasedNavigation } from '../utils/navigation';

// Helper function to check if token is valid and not expired
const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp > currentTime;
    } catch (error) {
        return false;
    }
};

const Profile = () => {
    const navigate = useNavigate();
    const { isEmployeeDashboard } = useRoleBasedNavigation();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // --- NEW: State for the email change security modal ---
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [passwordToVerify, setPasswordToVerify] = useState('');
    const [isEmailEditable, setIsEmailEditable] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No authentication token found.");
                }
                
                // Check if token is valid and not expired
                if (!isTokenValid(token)) {
                    localStorage.removeItem('token');
                    setError('Your session has expired. Please log in again.');
                    setTimeout(() => navigate('/'), 2000);
                    return;
                }
                
                console.log('Token found and valid:', token.substring(0, 20) + '...');
                
                const response = await axios.get('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                console.log('Profile response:', response.data);
                const decodedToken = jwtDecode(token);
                setUser({...response.data, role: decodedToken.user.role}); // Ensure role is set from token
                setFormData({ name: response.data.name, email: response.data.email || '', phone: response.data.phone || '' });
                
                // Load profile photo from server response or localStorage
                if (response.data.profilePhotoUrl) {
                    setProfilePhoto(response.data.profilePhotoUrl);
                } else {
                    const savedPhoto = localStorage.getItem(`profilePhoto_${decodedToken.user.id}`);
                    if (savedPhoto) {
                        setProfilePhoto(savedPhoto);
                    }
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    console.error('Error status:', err.response.status);
                    
                    // Handle specific error cases
                    if (err.response.status === 401 || err.response.status === 403) {
                        localStorage.removeItem('token');
                        setError('Your session has expired. Please log in again.');
                        setTimeout(() => navigate('/'), 2000);
                        return;
                    }
                    
                    setError(`Failed to fetch profile data: ${err.response.data.message || err.response.statusText}`);
                } else if (err.request) {
                    console.error('No response received:', err.request);
                    setError('Failed to fetch profile data: No response from server. Please make sure the server is running.');
                } else {
                    console.error('Error setting up request:', err.message);
                    setError(`Failed to fetch profile data: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserProfile();

        // Listen for profile photo updates from UserProfile component
        const handleProfilePhotoUpdate = (event) => {
            setProfilePhoto(event.detail.photoUrl);
        };

        window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);
        };
    }, [navigate]);

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
            // We only send editable fields to the backend
            const updateData = { name: formData.name, phone: formData.phone };
            if(isEmailEditable) {
                updateData.email = formData.email;
            }

            const response = await axios.put('/api/auth/me', updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(response.data.success) {
                setUser(prev => ({...prev, ...response.data.user}));
                setIsEditing(false);
                setIsEmailEditable(false); // Reset email editability
                setError(''); // Clear any previous errors
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    // --- NEW: Function to handle the password verification for changing email ---
    const handleVerifyPasswordForEmailChange = async () => {
        try {
            // We can reuse the login endpoint to verify the password
            await axios.post('/api/auth/login', { 
                username: user.username, 
                password: passwordToVerify,
                role: user.role
            });
            // If the request is successful, it means the password is correct
            setIsEmailEditable(true); // Make the email field editable
            setIsEmailModalOpen(false); // Close the password modal
            setPasswordToVerify(''); // Clear password
            setError(''); // Clear any previous errors
            setSuccessMessage('Email field unlocked! You can now edit your email address.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Password verification error:', err);
            alert("Incorrect password. Please try again.");
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('profilePhoto', file);

            const token = localStorage.getItem('token');
            const response = await axios.post('/api/auth/upload-profile-photo', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const photoUrl = response.data.photoUrl;
                setProfilePhoto(photoUrl);
                // Save to localStorage for quick access - using consistent key format
                const token = localStorage.getItem('token');
                const decodedToken = jwtDecode(token);
                localStorage.setItem(`profilePhoto_${decodedToken.user.id}`, photoUrl);
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
                    detail: { photoUrl } 
                }));
                
                setError(''); // Clear any previous errors
                setSuccessMessage('Profile picture uploaded successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            // Fallback to base64 encoding for local storage
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Photo = e.target.result;
                setProfilePhoto(base64Photo);
                // Use consistent key format with UserProfile component
                const token = localStorage.getItem('token');
                const decodedToken = jwtDecode(token);
                localStorage.setItem(`profilePhoto_${decodedToken.user.id}`, base64Photo);
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
                    detail: { photoUrl: base64Photo } 
                }));
                
                setError(''); // Clear any previous errors
                setSuccessMessage('Profile picture saved locally!');
                setTimeout(() => setSuccessMessage(''), 3000);
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    const handleChangePictureClick = () => {
        fileInputRef.current?.click();
    };


    if (loading) return <div className="profile-page-layout"><p className="status-message">Loading profile...</p></div>;
    if (error) return <div className="profile-page-layout"><p className="status-message error">{error}</p></div>;
    if (!user) return <div className="profile-page-layout"><p className="status-message">No user data found.</p></div>;

    return (
        <div className="profile-page-layout">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <header className="profile-page-header">
                <button className="back-arrow" onClick={() => navigate(isEmployeeDashboard ? '/employee-dashboard' : '/dashboard')}>‹</button>
                <h1>Profile</h1>
            </header>
            
            {/* Success Message */}
            {successMessage && (
                <div className="success-message">
                    <span className="success-icon">✅</span>
                    {successMessage}
                </div>
            )}
            
            <main className="profile-content">
                <div className="profile-card-left">
                    <div className="profile-avatar">
                        {profilePhoto ? (
                            <img 
                                src={profilePhoto} 
                                alt="User Avatar" 
                                className="profile-picture"
                            />
                        ) : (
                            <div className="profile-picture-placeholder">
                                <span className="user-icon-large">👤</span>
                            </div>
                        )}
                        {isUploading && <div className="upload-overlay-profile">⏳</div>}
                    </div>
                    <h2>{user.name}</h2>
                    <button 
                        className="change-picture-btn" 
                        onClick={handleChangePictureClick}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Change Picture'}
                    </button>
                </div>
                <div className="profile-card-right">
                    <div className="card-header">
                        <h3>Your Information</h3>
                        {!isEditing && <button className="edit-button" onClick={() => setIsEditing(true)}>✎ Edit</button>}
                    </div>
                    <form onSubmit={handleSaveClick} className="profile-form">
                        <div className="input-group"><label>Full Name:</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} /></div>
                        
                        {/* --- UPDATED: Email field with edit button --- */}
                        <div className="input-group">
                            <label>Email Address:</label>
                            <div className="input-with-icon">
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing || !isEmailEditable} />
                                {isEditing && !isEmailEditable && (
                                    <button type="button" className="inline-edit-btn" title="Verify to change email" onClick={() => setIsEmailModalOpen(true)}>✎</button>
                                )}
                            </div>
                        </div>

                        <div className="input-group"><label>Username:</label><input type="text" value={user.username || ''} disabled /></div>
                        <div className="input-group"><label>Phone Number:</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} /></div>
                        <div className="input-group"><label>Role:</label><input type="text" value={user.role || ''} disabled /></div>
                        
                        {isEditing && (
                            <div className="form-actions">
                                <button type="submit" className="save-button">Save Changes</button>
                                <button type="button" className="cancel-button" onClick={() => { setIsEditing(false); setIsEmailEditable(false); }}>Cancel</button>
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
            
            {/* --- NEW: Password Verification Modal for Email Change --- */}
            {isEmailModalOpen && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal">
                        <h3>Confirm Identity</h3>
                        <p>To change your email, please enter your current password.</p>
                        <input 
                            type="password" 
                            className="password-verify-input" 
                            value={passwordToVerify}
                            onChange={(e) => setPasswordToVerify(e.target.value)}
                            placeholder="Enter password"
                        />
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
