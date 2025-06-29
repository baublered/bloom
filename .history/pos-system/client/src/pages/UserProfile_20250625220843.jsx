import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css'; // We will create this CSS file

const UserProfile = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    // This effect runs once to get the user's data from the stored token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // The decoded token has a 'user' object inside it
                setUser(decodedToken.user);
            } catch (error) {
                console.error("Error decoding token:", error);
                // Handle invalid token, maybe log the user out
            }
        }
    }, []);

    const handleLogout = () => {
        // Clear the token and redirect to the login page
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleProfileClick = () => {
        // Navigate to the correct profile page based on the user's role
        if (user?.role === 'admin') {
            navigate('/admin-profile');
        } else if (user?.role === 'employee') {
            navigate('/employee-profile');
        }
    };
    
    // Fallback if user data isn't loaded yet
    const displayName = user ? user.name : 'User';

    return (
        <div className="user-profile-container">
            <button className="user-profile-button" onClick={() => setIsOpen(!isOpen)}>
                <span className="user-icon">👤</span>
                <span>{displayName}</span>
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="profile-dropdown-menu">
                    <a onClick={handleProfileClick}>Profile</a>
                    <a onClick={handleLogout} className="logout-link">Logout</a>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
