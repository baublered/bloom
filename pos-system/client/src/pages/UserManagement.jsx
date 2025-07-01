import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';
import './Dashboard.css';
import UserProfile from './UserProfile';
import Sidebar from './Sidebar';
import { useRoleBasedNavigation } from '../utils/navigation';
import { useAppContext } from '../context/AppContext';

const UserManagement = () => {
  const navigate = useNavigate();
  const { getNavigationPath, isEmployeeDashboard } = useRoleBasedNavigation();
  const { state } = useAppContext();
  
  const [users, setUsers] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'

  // Check if current user is admin, redirect if not
  useEffect(() => {
    if (state.user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchUserLogs();
  }, [state.user, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    }
  };

  const fetchUserLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/user-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserLogs(response.data.logs || []);
    } catch (err) {
      setError('Failed to fetch user logs');
      console.error('Error fetching user logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/auth/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh users list
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewLogs = (user) => {
    setSelectedUser(user);
    setShowLogsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredLogs = () => {
    if (!selectedUser) return userLogs;
    return userLogs.filter(log => log.userId === selectedUser._id);
  };

  // Show access denied if not admin
  if (state.user?.role !== 'admin') {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page. Admin privileges required.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="dashboard-container">
      {!isEmployeeDashboard && <Sidebar />}
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>User Management</h1>
          <UserProfile />
        </header>

        <div className="user-management-content">
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Management
            </button>
            <button 
              className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              📋 User Activity Logs
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h3>Registered Users</h3>
              </div>

              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`role-badge ${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            {user.role !== 'admin' && (
                              <button 
                                className="action-btn delete"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete User"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-section">
              <div className="section-header">
                <h3>User Activity Logs</h3>
                <div className="logs-summary">
                  <span>Total Logs: {userLogs.length}</span>
                </div>
              </div>

              <div className="logs-table-container">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLogs.map(log => (
                      <tr key={log._id}>
                        <td>{formatDate(log.createdAt || log.timestamp)}</td>
                        <td>{log.userName || log.username}</td>
                        <td>
                          <span className={`action-badge ${log.action.toLowerCase().replace(' ', '-')}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.details || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal delete-modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?</p>
              <p className="warning">This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="btn btn-cancel"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={handleDeleteUser}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Logs Modal */}
        {showLogsModal && (
          <div className="modal-overlay">
            <div className="modal logs-modal">
              <div className="modal-header">
                <h3>Activity Logs for {selectedUser?.name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowLogsModal(false);
                    setSelectedUser(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <div className="logs-table-container">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredLogs().map(log => (
                        <tr key={log._id}>
                          <td>{formatDate(log.createdAt || log.timestamp)}</td>
                          <td>
                            <span className={`action-badge ${log.action.toLowerCase().replace(' ', '-')}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>{log.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;
