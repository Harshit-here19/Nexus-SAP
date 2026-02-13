// src/components/Auth/LoginScreen.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SapButton from '../Common/SapButton';

const LoginScreen = () => {
  const { login, register, loginError, clearError } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    department: ''
  });

  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(loginData.username, loginData.password);
      setIsLoading(false);
    }, 500); // Simulate loading
  };

  // Handle register
  const handleRegister = (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // Validation
    if (!registerData.username || !registerData.password || !registerData.firstName ||
      !registerData.lastName || !registerData.email) {
      setRegisterError('Please fill in all required fields');
      return;
    }

    if (registerData.username.length < 3) {
      setRegisterError('Username must be at least 3 characters');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = register(registerData);

      if (result.success) {
        setRegisterSuccess('Registration successful! You can now log in.');
        setRegisterData({
          username: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          email: '',
          department: ''
        });
        setTimeout(() => {
          setIsRegisterMode(false);
          setRegisterSuccess('');
        }, 2000);
      } else {
        setRegisterError(result.message);
      }
      setIsLoading(false);
    }, 500);
  };

  // Switch mode
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    clearError();
    setRegisterError('');
    setRegisterSuccess('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #2b6cb0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isRegisterMode ? '500px' : '420px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #354a5f 0%, #2c3e50 100%)',
          padding: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            📦
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            SAP GUI Clone
          </h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '12px' }}>
            {isRegisterMode ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '15px 30px' }}>
          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLogin}>
              {loginError && (
                <div style={{
                  background: '#ffeaea',
                  border: '1px solid #bb0000',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#bb0000',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>❌</span>
                  {loginError}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '11px',
                  color: '#32363a'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    height: '44px',
                    border: '1px solid #89919a',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0a6ed1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(10,110,209,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#89919a';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#32363a'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    height: '44px',
                    border: '1px solid #89919a',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0a6ed1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(10,110,209,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#89919a';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <SapButton
                type="primary"
                onClick={handleLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                {isLoading ? '⏳ Signing in...' : '🔐 Sign In'}
              </SapButton>

              <div style={{
                marginTop: '10px',
                padding: '10px 16px',
                background: '#f7f7f7',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#6a6d70'
              }}>
                <strong>Demo Credentials:</strong>
                <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                  {/* <div style={{
                    padding: '8px',
                    background: 'linear-gradient(90deg, rgba(233,115,12,0.1) 0%, transparent 100%)',
                    borderRadius: '4px',
                    borderLeft: '3px solid var(--sap-critical)'
                  }}>
                    <div style={{ fontWeight: '600', color: '#333' }}>Admin User:</div>
                    <div>
                      Username: <code style={{ background: '#e5e5e5', padding: '2px 6px', borderRadius: '3px' }}>ADMIN</code>
                      &nbsp;|&nbsp;
                      Password: <code style={{ background: '#e5e5e5', padding: '2px 6px', borderRadius: '3px' }}>admin123</code>
                    </div>
                  </div> */}
                  <div style={{
                    padding: '8px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e5e5e5'
                  }}>
                    <div style={{ fontWeight: '600', color: '#333' }}>Regular User:</div>
                    <div>
                      Username: <code style={{ background: '#e5e5e5', padding: '2px 6px', borderRadius: '3px' }}>SAPUSER</code>
                      &nbsp;|&nbsp;
                      Password: <code style={{ background: '#e5e5e5', padding: '2px 6px', borderRadius: '3px' }}>welcome123</code>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister}>
              {registerError && (
                <div style={{
                  background: '#ffeaea',
                  border: '1px solid #bb0000',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#bb0000',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>❌</span>
                  {registerError}
                </div>
              )}

              {registerSuccess && (
                <div style={{
                  background: '#d5f0df',
                  border: '1px solid #107e3e',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#107e3e',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>✅</span>
                  {registerSuccess}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#32363a'
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    placeholder="First name"
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #89919a',
                      borderRadius: '6px',
                      padding: '0 12px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#32363a'
                  }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    placeholder="Last name"
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #89919a',
                      borderRadius: '6px',
                      padding: '0 12px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: '#32363a'
                }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="Choose a username"
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #89919a',
                    borderRadius: '6px',
                    padding: '0 12px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: '#32363a'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #89919a',
                    borderRadius: '6px',
                    padding: '0 12px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: '#32363a'
                }}>
                  Department
                </label>
                <select
                  value={registerData.department}
                  onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #89919a',
                    borderRadius: '6px',
                    padding: '0 12px',
                    fontSize: '13px',
                    background: 'white'
                  }}
                >
                  <option value="">Select department</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchasing">Purchasing</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Production">Production</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#32363a'
                  }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #89919a',
                      borderRadius: '6px',
                      padding: '0 12px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#32363a'
                  }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #89919a',
                      borderRadius: '6px',
                      padding: '0 12px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <SapButton
                type="primary"
                onClick={handleRegister}
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                {isLoading ? '⏳ Creating account...' : '📝 Create Account'}
              </SapButton>
            </form>
          )}

          {/* Toggle Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e5e5e5'
          }}>
            <span style={{ color: '#6a6d70', fontSize: '14px' }}>
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#0a6ed1',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '8px',
                fontSize: '14px'
              }}
            >
              {isRegisterMode ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f7f7f7',
          padding: '16px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#6a6d70',
          borderTop: '1px solid #e5e5e5'
        }}>
          SAP GUI Clone © 2024 | Built with React.js | No Backend Required
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;