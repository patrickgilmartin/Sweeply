import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { User } from '../services/authService';
import { useFileSystemAccess } from '../hooks/useFileSystemAccess';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { directoryHandle, requestAccess, clearAccess, browserInfo } = useFileSystemAccess();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleRequestAccess = async () => {
    await requestAccess();
  };

  const handleClearAccess = async () => {
    await clearAccess();
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="scanning-screen">
          <h2>Loading...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Profile</h1>

        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Account</h2>
          <p style={{ color: '#888', marginBottom: '5px' }}>Email: {user?.email}</p>
          <p style={{ color: '#888', fontSize: '14px' }}>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '10px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>File System Access</h2>
          <p style={{ color: '#888', marginBottom: '10px', fontSize: '14px' }}>
            Browser: {browserInfo.name} {browserInfo.version}
          </p>
          <p style={{ color: '#888', marginBottom: '10px', fontSize: '14px' }}>
            File System Access API: {browserInfo.supportsFileSystemAccess ? '✅ Supported' : '❌ Not Supported'}
          </p>
          {directoryHandle ? (
            <div style={{ marginTop: '15px' }}>
              <p style={{ color: '#00ff88', marginBottom: '10px' }}>Directory access granted ✅</p>
              <button
                onClick={handleClearAccess}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff3366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Clear Access
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <p style={{ color: '#888', marginBottom: '10px' }}>No directory access</p>
              {browserInfo.supportsFileSystemAccess && (
                <button
                  onClick={handleRequestAccess}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#00ff88',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Request Directory Access
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: '#ff3366',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
