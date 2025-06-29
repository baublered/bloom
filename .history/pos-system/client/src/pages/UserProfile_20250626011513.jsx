import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken.user);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleProfileClick = () => {
        if (user?.role === 'admin') {
            navigate('/dashboard/profile'); // Correct path for nested admin profile
        } else if (user?.role === 'employee') {
            navigate('/employee-dashboard/profile'); // Correct path for nested employee profile
        }
    };
    
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
