// src/components/Auth/LoginScreen.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SapButton from '../Common/SapButton';
import styles from './LoginScreen.module.css';

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
    }, 500);
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
    <div className={styles.loginContainer}>
      <div className={`${styles.card} ${isRegisterMode ? styles.cardRegister : styles.cardLogin}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>📦</div>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>SAP GUI</h1>
            <p className={styles.headerSubtitle}>
              {isRegisterMode ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLogin}>
              {loginError && (
                <div className={styles.alertError}>
                  <span>❌</span>
                  {loginError}
                </div>
              )}

              <div className={styles.inputWrapper} >
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={styles.floatingInput}
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder=""
                  />
                  <label className={styles.floatingLabel}>Username</label>
                </div>
              </div>

              <div className={styles.inputWrapper} >
                <div className={styles.formGroupLarge}>
                  <input
                    type="password"
                    className={styles.floatingInput}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder=""
                  />
                  <label className={styles.floatingLabel}>Password</label>
                </div>
              </div>

              <SapButton
                type="signup"
                onClick={handleLogin}
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? '⏳ Signing in...' : '🔐 Sign In'}
              </SapButton>

              <div className={styles.demoBox}>
                <strong className={styles.demoTitle}>Demo Credentials:</strong>
                <div className={styles.demoGrid}>
                  <div className={styles.demoItem}>
                    <div className={styles.demoItemTitle}>Regular User:</div>
                    <div>
                      Username: <code className={styles.code}>SAPUSER</code>
                      &nbsp;|&nbsp;
                      Password: <code className={styles.code}>welcome123</code>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister}>
              {registerError && (
                <div className={styles.alertError}>
                  <span>❌</span>
                  {registerError}
                </div>
              )}

              {registerSuccess && (
                <div className={styles.alertSuccess}>
                  <span>✅</span>
                  {registerSuccess}
                </div>
              )}

              <div className={styles.gridTwo}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.floatingInput}
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    placeholder=''
                  />
                  <label className={styles.floatingLabel}>First Name *</label>
                </div>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.floatingInput}
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    placeholder=''
                  />
                  <label className={styles.floatingLabel}>Last Name *</label>
                </div>
              </div>

              <div className={styles.formGroupSmall}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.floatingInput}
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder=''
                  />
                  <label className={styles.floatingLabel}>Username *</label>
                </div>

              </div>

              <div className={styles.formGroupSmall}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    className={styles.floatingInput}
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder=''
                  />
                  <label className={styles.floatingLabel}>Email *</label>
                </div>
              </div>

              <div className={styles.formGroupSmall}>
                <div className={styles.inputWrapper}>
                  <select
                    className={styles.floatingInput}
                    value={registerData.department}
                    onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                    placeholder=""
                  >
                    <option value="" disabled hidden></option>
                    <option value="Sales">Sales</option>
                    <option value="Purchasing">Purchasing</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Production">Production</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                  <label className={styles.floatingLabel}>Department</label>
                </div>
              </div>

              <div className={styles.gridTwoLarge}>
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    className={styles.floatingInput}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder=""
                  />
                  <label className={styles.floatingLabel}>Password *</label>
                </div>
                <div className={styles.inputWrapper} >
                  <input
                    type="password"
                    className={styles.floatingInput}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder=""
                  />
                  <label className={styles.floatingLabel}>Confirm Password *</label>
                </div>
              </div>

              <SapButton
                type="signup"
                onClick={handleRegister}
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? '⏳ Creating account...' : '📝 Create Account'}
              </SapButton>
            </form>
          )}

          {/* Toggle Link */}
          <div className={styles.toggleSection}>
            <span className={styles.toggleText}>
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className={styles.toggleButton}
            >
              {isRegisterMode ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;