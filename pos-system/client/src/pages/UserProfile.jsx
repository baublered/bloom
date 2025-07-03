import { jwtDecode } from 'jwt-decode';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Determine if we're in employee dashboard context
    const isInEmployeeDashboard = location.pathname.startsWith('/employee-dashboard');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken.user);
                // Load profile photo if exists
                const savedPhoto = localStorage.getItem(`profilePhoto_${decodedToken.user.id}`);
                if (savedPhoto) {
                    setProfilePhoto(savedPhoto);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }

        // Listen for profile photo updates from Profile component
        const handleProfilePhotoUpdate = (event) => {
            setProfilePhoto(event.detail.photoUrl);
        };

        window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);
        };
    }, []);

    const handleProfileClick = () => {
        setIsOpen(false); // Close dropdown when navigating
        
        // Navigate based on current context, not just user role
        if (isInEmployeeDashboard) {
            navigate('profile'); // Relative navigation within employee dashboard
        } else {
            navigate('/profile'); // Absolute navigation for admin dashboard
        }
    };

    const handleLogout = () => {
        setIsOpen(false); // Close dropdown
        localStorage.removeItem('token');
        navigate('/');
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
                // Save to localStorage for quick access
                localStorage.setItem(`profilePhoto_${user.id}`, photoUrl);
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
                    detail: { photoUrl } 
                }));
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            // Fallback to base64 encoding for local storage
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Photo = e.target.result;
                setProfilePhoto(base64Photo);
                localStorage.setItem(`profilePhoto_${user.id}`, base64Photo);
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
                    detail: { photoUrl: base64Photo } 
                }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const removePhoto = () => {
        setProfilePhoto(null);
        if (user) {
            localStorage.removeItem(`profilePhoto_${user.id}`);
        }
        // Also send request to server to remove photo
        const token = localStorage.getItem('token');
        if (token) {
            axios.delete('/api/auth/remove-profile-photo', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(error => console.error('Error removing photo from server:', error));
        }
    };
    
    const displayName = user ? user.name : 'User';
    const userRole = user ? user.role : '';

    return (
        <div className="user-profile-container">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <button className="user-profile-button" onClick={() => setIsOpen(!isOpen)}>
                <div className="user-avatar" onClick={handlePhotoClick}>
                    {profilePhoto ? (
                        <img 
                            src={profilePhoto} 
                            alt="Profile" 
                            className="user-profile-image"
                        />
                    ) : (
                        <span className="user-icon">👤</span>
                    )}
                    {isUploading && <div className="upload-overlay">⏳</div>}
                </div>
                <div className="user-info">
                    <span className="user-name">{displayName}</span>
                    <span className="user-role">{userRole}</span>
                </div>
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="profile-dropdown-menu">
                    <div className="dropdown-header">
                        <div className="dropdown-avatar" onClick={handlePhotoClick}>
                            {profilePhoto ? (
                                <img 
                                    src={profilePhoto} 
                                    alt="Profile" 
                                    className="dropdown-profile-image"
                                />
                            ) : (
                                <div className="dropdown-avatar-placeholder">👤</div>
                            )}
                            {isUploading && <div className="upload-overlay">⏳</div>}
                        </div>
                        <div className="dropdown-user-info">
                            <span className="dropdown-name">{displayName}</span>
                            <span className="dropdown-role">{userRole}</span>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleProfileClick}>
                        <span className="dropdown-icon">⚙️</span>
                        <span>View Profile</span>
                    </button>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                        <span className="dropdown-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
