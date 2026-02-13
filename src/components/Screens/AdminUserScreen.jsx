// src/components/Screens/AdminUserScreen.jsx
import React, { useState, useEffect } from 'react';
import SapButton from '../Common/SapButton';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import {
  getUsers,
  updateUser,
  deleteUser,
  resetUserPassword,
  unlockUser,
  registerUser
} from '../../utils/storage';

const AdminUserScreen = () => {
  const { updateStatus } = useTransaction();
  const { user: currentUser, checkIsAdmin } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPassword, setShowPassword] = useState({});

  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'User',
    department: '',
    isActive: true
  });

  // Check admin access
  const isAdmin = checkIsAdmin();

  // Load users
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive && !user.isLocked) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'locked' && user.isLocked);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle password visibility
  const togglePasswordVisibility = (userId) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Handle user activation/deactivation
  const handleToggleActive = (user) => {
    const result = updateUser(user.id, { isActive: !user.isActive });
    if (result.success) {
      loadUsers();
      updateStatus(`User ${user.username} ${user.isActive ? 'deactivated' : 'activated'}`, 'success');
    } else {
      updateStatus(result.message, 'error');
    }
  };

  // Handle user unlock
  const handleUnlock = (user) => {
    const result = unlockUser(user.id);
    if (result.success) {
      loadUsers();
      updateStatus(`User ${user.username} unlocked`, 'success');
    } else {
      updateStatus(result.message, 'error');
    }
  };

  // Handle password reset
  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      updateStatus('Password must be at least 6 characters', 'warning');
      return;
    }

    const result = resetUserPassword(selectedUser.id, newPassword);
    if (result.success) {
      loadUsers();
      setShowPasswordModal(false);
      setNewPassword('');
      updateStatus(`Password reset for ${selectedUser.username}`, 'success');
    } else {
      updateStatus(result.message, 'error');
    }
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    const result = deleteUser(selectedUser.id);
    if (result.success) {
      loadUsers();
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      updateStatus(`User ${selectedUser.username} deleted`, 'success');
    } else {
      updateStatus(result.message, 'error');
    }
  };

  // Handle create user
  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.firstName || 
        !newUser.lastName || !newUser.email) {
      updateStatus('Please fill in all required fields', 'warning');
      return;
    }

    // Create with role
    const result = registerUser({
      ...newUser,
      role: newUser.role
    });

    if (result.success) {
      // If role is Admin, update it
      if (newUser.role === 'Admin' && result.user) {
        updateUser(result.user.id, { role: 'Admin' });
      }
      
      loadUsers();
      setShowCreateModal(false);
      setNewUser({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'User',
        department: '',
        isActive: true
      });
      updateStatus('User created successfully', 'success');
    } else {
      updateStatus(result.message, 'error');
    }
  };

  // Handle role change
  const handleRoleChange = (user, newRole) => {
    if (user.id === currentUser.userId && newRole !== 'Admin') {
      updateStatus('Cannot change your own role', 'warning');
      return;
    }

    const result = updateUser(user.id, { role: newRole });
    if (result.success) {
      loadUsers();
      updateStatus(`User ${user.username} role changed to ${newRole}`, 'success');
    } else {
      updateStatus(result.message, 'error');
    }
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (user.isLocked) {
      return <span className="sap-badge error">🔒 Locked</span>;
    }
    if (!user.isActive) {
      return <span className="sap-badge warning">Inactive</span>;
    }
    return <span className="sap-badge success">Active</span>;
  };

  // *** IMPORTANT: Check if current user is admin ***
  if (!isAdmin) {
    return (
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>🚫 Access Denied - ZADMIN</span>
        </div>
        <div className="sap-panel-content">
          <div className="sap-message-strip error" style={{ marginBottom: '20px' }}>
            <span className="sap-message-strip-icon">🔒</span>
            <span>
              <strong>Access Denied!</strong> You do not have permission to access User Administration.
              This transaction is only available to users with <strong>Admin</strong> role.
            </span>
          </div>
          <div style={{ 
            padding: '20px', 
            background: 'var(--sap-content-bg)', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚷</div>
            <h3>Administrator Access Required</h3>
            <p style={{ color: 'var(--sap-text-secondary)', marginTop: '8px' }}>
              Your current role: <strong>{currentUser?.role || 'Unknown'}</strong>
            </p>
            <p style={{ color: 'var(--sap-text-secondary)', marginTop: '8px' }}>
              Please contact your system administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Panel */}
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">👥</span>
            User Administration - ZADMIN
          </span>
          <span className="sap-badge error">🔐 ADMIN ONLY</span>
        </div>
        <div className="sap-panel-content">
          <div className="sap-message-strip warning" style={{ marginBottom: '20px' }}>
            <span className="sap-message-strip-icon">⚠️</span>
            <span>
              <strong>Security Notice:</strong> This screen displays sensitive information including passwords.
              Handle with care and do not share this information.
            </span>
          </div>

          {/* Toolbar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="sap-input"
                placeholder="🔍 Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '250px' }}
              />
              <select
                className="sap-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
              <select
                className="sap-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <SapButton onClick={() => setShowCreateModal(true)} type="primary" icon="➕">
                Create User
              </SapButton>
              <SapButton onClick={loadUsers} icon="🔄">
                Refresh
              </SapButton>
            </div>
          </div>

          {/* Users Table */}
          <div className="sap-table-container">
            <table className="sap-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Username</th>
                  <th style={{ width: '150px' }}>Name</th>
                  <th style={{ width: '180px' }}>Email</th>
                  <th style={{ width: '150px' }}>Password</th>
                  <th style={{ width: '80px' }}>Role</th>
                  <th style={{ width: '100px' }}>Department</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '120px' }}>Last Login</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                        {user.id === currentUser?.userId && (
                          <span style={{ 
                            marginLeft: '8px',
                            fontSize: '10px',
                            color: 'var(--sap-brand)'
                          }}>
                            (You)
                          </span>
                        )}
                      </td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td style={{ fontSize: '12px' }}>{user.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{
                            background: '#f5f5f5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                          }}>
                            {showPassword[user.id] ? user.password : '••••••••'}
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title={showPassword[user.id] ? 'Hide password' : 'Show password'}
                          >
                            {showPassword[user.id] ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <select
                          className="sap-select"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          disabled={user.id === currentUser?.userId}
                          style={{ 
                            width: '100%', 
                            height: '28px',
                            fontSize: '12px'
                          }}
                        >
                          <option value="User">User</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td>{user.department || '-'}</td>
                      <td>{getStatusBadge(user)}</td>
                      <td style={{ fontSize: '11px' }}>
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString()
                          : 'Never'
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {user.isLocked && (
                            <button
                              className="sap-toolbar-button"
                              onClick={() => handleUnlock(user)}
                              title="Unlock User"
                              style={{ color: 'var(--sap-positive)' }}
                            >
                              🔓
                            </button>
                          )}
                          <button
                            className="sap-toolbar-button"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPasswordModal(true);
                            }}
                            title="Reset Password"
                          >
                            🔑
                          </button>
                          <button
                            className="sap-toolbar-button"
                            onClick={() => handleToggleActive(user)}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            style={{ 
                              color: user.isActive ? 'var(--sap-critical)' : 'var(--sap-positive)' 
                            }}
                          >
                            {user.isActive ? '🚫' : '✅'}
                          </button>
                          {user.id !== currentUser?.userId && (
                            <button
                              className="sap-toolbar-button"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete User"
                              style={{ color: 'var(--sap-negative)' }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--sap-content-bg)',
            borderRadius: '8px',
            display: 'flex',
            gap: '32px'
          }}>
            <div>
              <span style={{ color: 'var(--sap-text-secondary)', fontSize: '12px' }}>Total Users</span>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--sap-brand)' }}>
                {users.length}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--sap-text-secondary)', fontSize: '12px' }}>Active</span>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--sap-positive)' }}>
                {users.filter(u => u.isActive && !u.isLocked).length}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--sap-text-secondary)', fontSize: '12px' }}>Admins</span>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--sap-critical)' }}>
                {users.filter(u => u.role === 'Admin').length}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--sap-text-secondary)', fontSize: '12px' }}>Locked</span>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--sap-negative)' }}>
                {users.filter(u => u.isLocked).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <SapModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setNewPassword('');
        }}
        title="🔑 Reset Password"
        width="400px"
        footer={
          <>
            <SapButton onClick={() => {
              setShowPasswordModal(false);
              setNewPassword('');
            }}>
              Cancel
            </SapButton>
            <SapButton onClick={handleResetPassword} type="primary">
              Reset Password
            </SapButton>
          </>
        }
      >
        {selectedUser && (
          <div>
            <p style={{ marginBottom: '16px' }}>
              Reset password for user: <strong>{selectedUser.username}</strong>
            </p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                New Password *
              </label>
              <input
                type="text"
                className="sap-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                style={{ width: '100%' }}
              />
            </div>
            <div className="sap-message-strip info">
              <span className="sap-message-strip-icon">ℹ️</span>
              <span>This will unlock the user if they were locked out.</span>
            </div>
          </div>
        )}
      </SapModal>

      {/* Create User Modal */}
      <SapModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="➕ Create New User"
        width="500px"
        footer={
          <>
            <SapButton onClick={() => setShowCreateModal(false)}>
              Cancel
            </SapButton>
            <SapButton onClick={handleCreateUser} type="primary">
              Create User
            </SapButton>
          </>
        }
      >
        <div className="sap-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
                First Name *
              </label>
              <input
                type="text"
                className="sap-input"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
                Last Name *
              </label>
              <input
                type="text"
                className="sap-input"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
              Username *
            </label>
            <input
              type="text"
              className="sap-input"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Will be converted to uppercase"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
              Email *
            </label>
            <input
              type="email"
              className="sap-input"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
              Password *
            </label>
            <input
              type="text"
              className="sap-input"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Minimum 6 characters"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
                Role
              </label>
              <select
                className="sap-select"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px' }}>
                Department
              </label>
              <select
                className="sap-select"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">Select...</option>
                <option value="Sales">Sales</option>
                <option value="Purchasing">Purchasing</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Production">Production</option>
              </select>
            </div>
          </div>
        </div>
      </SapModal>

      {/* Delete Confirmation Modal */}
      <SapModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="⚠️ Confirm Delete"
        width="400px"
        footer={
          <>
            <SapButton onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </SapButton>
            <SapButton onClick={handleDeleteUser} type="danger">
              Delete User
            </SapButton>
          </>
        }
      >
        {selectedUser && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ marginBottom: '12px' }}>Delete User?</h3>
            <p style={{ color: 'var(--sap-text-secondary)' }}>
              Are you sure you want to delete user <strong>{selectedUser.username}</strong>?
              <br />
              This action cannot be undone and all user data will be lost.
            </p>
          </div>
        )}
      </SapModal>
    </div>
  );
};

export default AdminUserScreen;