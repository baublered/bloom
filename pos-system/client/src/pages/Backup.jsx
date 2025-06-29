import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Backup.css';
import './Dashboard.css';
import UserProfile from './UserProfile';
import Sidebar from './Sidebar';
import EmployeeSidebar from './EmployeeSidebar';
import { useRoleBasedNavigation } from '../utils/navigation';

const Backup = () => {
  const navigate = useNavigate();
  const { isEmployeeDashboard } = useRoleBasedNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [backupStats, setBackupStats] = useState(null);

  const formatDate = (date) => {
    return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setMessage('');
    setBackupStats(null);
    
    try {
      const response = await axios.get('/api/backup/export');
      
      if (response.data.success) {
        const backupData = response.data.backup;
        setBackupStats(backupData.counts);
        
        // Create downloadable file
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with timestamp
        const timestamp = formatDate(new Date());
        link.download = `bloomtrack-backup-${timestamp}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        setMessage('✅ Backup created successfully! File downloaded to your computer.');
      } else {
        setMessage('❌ Failed to create backup. Please try again.');
      }
    } catch (error) {
      console.error('Backup error:', error);
      setMessage('❌ Error creating backup. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {!isEmployeeDashboard && <Sidebar />}
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="back-arrow" onClick={() => navigate(isEmployeeDashboard ? '/employee-dashboard/maintenance' : '/maintenance')}>‹</button>
          <h1>System Backup</h1>
          <UserProfile />
        </header>

        <div className="backup-content">
          <div className="backup-panel">
            <div className="backup-info">
              <div className="backup-icon">💾</div>
              <h2>Local System Backup</h2>
              <p>Create a complete backup of all your BloomTrack data including products, transactions, events, and user accounts. The backup will be downloaded as a JSON file to your computer for safe keeping.</p>
              
              <div className="backup-features">
                <div className="feature-item">
                  <span className="feature-icon">📦</span>
                  <div className="feature-text">
                    <strong>Complete Data Export</strong>
                    <span>All products, transactions, events, and users</span>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📅</span>
                  <div className="feature-text">
                    <strong>Timestamped Files</strong>
                    <span>Each backup includes creation date and time</span>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div className="feature-text">
                    <strong>Secure & Local</strong>
                    <span>Data stays on your computer, passwords excluded</span>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💼</span>
                  <div className="feature-text">
                    <strong>Business Continuity</strong>
                    <span>Protect against data loss and system failures</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="backup-actions">
              <button 
                className={`backup-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleBackup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">💾</span>
                    Create Backup Now
                  </>
                )}
              </button>

              {message && (
                <div className={`backup-message ${message.includes('✅') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              {backupStats && (
                <div className="backup-stats">
                  <h3>📊 Backup Summary</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{backupStats.products}</span>
                      <span className="stat-label">Products</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{backupStats.transactions}</span>
                      <span className="stat-label">Transactions</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{backupStats.events}</span>
                      <span className="stat-label">Events</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{backupStats.users}</span>
                      <span className="stat-label">Users</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="backup-instructions">
              <h3>📋 How to Use Your Backup</h3>
              <div className="instructions-grid">
                <div className="instruction-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <strong>Download Location</strong>
                    <p>Backup files are saved to your default download folder</p>
                  </div>
                </div>
                <div className="instruction-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <strong>File Naming</strong>
                    <p>Files are named: bloomtrack-backup-YYYY-MM-DDTHH-MM-SS.json</p>
                  </div>
                </div>
                <div className="instruction-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <strong>Safe Storage</strong>
                    <p>Store backup files in multiple secure locations</p>
                  </div>
                </div>
                <div className="instruction-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <strong>Regular Backups</strong>
                    <p>Create backups regularly - daily for active businesses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Backup;
