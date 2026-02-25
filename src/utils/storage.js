// src/utils/storage.js

const STORAGE_KEY = "sap_gui_data";
const USERS_KEY = "sap_users";
const SESSION_KEY = "sap_session";
const FAVORITES_KEY = "sap_favorites";
const HISTORY_KEY = "sap_history";

// ========== USER-SPECIFIC DATA STORAGE ==========

// Get user-specific storage key
const getUserStorageKey = (userId) => {
  return `sap_user_data_${userId}`;
};

// Get current user ID from session
const getCurrentUserId = () => {
  const session = getSession();
  return session?.userId || null;
};

// Get all data for current user
export const getAllData = (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();

    if (!uid) {
      return getDefaultData();
    }

    const key = getUserStorageKey(uid);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : getDefaultData();
  } catch (error) {
    // console.error("Error reading from localStorage:", error);
    return getDefaultData();
  }
};

// Save all data for current user
export const saveAllData = (data, userId = null) => {
  try {
    const uid = userId || getCurrentUserId();

    if (!uid) {
      // console.error("No user ID provided for saving data");
      return false;
    }

    const key = getUserStorageKey(uid);
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    // console.error("Error saving to localStorage:", error);
    return false;
  }
};

// Get specific table data for current user
export const getTableData = (tableName, userId = null) => {
  const allData = getAllData(userId);
  // return allData[tableName] || [];
  
  const data = allData[tableName] || [];

  if (data.length === 0) return data;

  // Get first key of the first row to use for sorting
  const sortKey = Object.keys(data[0])[0];

  return [...data].sort((a, b) => {
    const valA = a[sortKey] || 0;
    const valB = b[sortKey] || 0;

    // If numeric, compare numerically
    const numA = parseInt(String(valA).replace(/^\D+/g, ""), 10);
    const numB = parseInt(String(valB).replace(/^\D+/g, ""), 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // Otherwise, fallback to string comparison
    return String(valA).localeCompare(String(valB));
  });
};

// Save table data for current user
export const saveTableData = (tableName, data, userId = null) => {
  const allData = getAllData(userId);
  allData[tableName] = data;
  return saveAllData(allData, userId);
};

// Add record to table for current user
export const addRecord = (tableName, record, userId = null) => {
  const uid = userId || getCurrentUserId();
  const tableData = getTableData(tableName, uid);
  const newRecord = {
    ...record,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: uid,
  };
  tableData.push(newRecord);
  saveTableData(tableName, tableData, uid);
  return newRecord;
};

// Update record for current user
export const updateRecord = (tableName, id, updates, userId = null) => {
  const uid = userId || getCurrentUserId();
  const tableData = getTableData(tableName, uid);
  const index = tableData.findIndex((r) => r.id === id);
  if (index !== -1) {
    tableData[index] = {
      ...tableData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: uid,
    };
    saveTableData(tableName, tableData, uid);
    return tableData[index];
  }
  return null;
};

// Delete record for current user
export const deleteRecord = (tableName, id, userId = null) => {
  const uid = userId || getCurrentUserId();
  const tableData = getTableData(tableName, uid);
  const filtered = tableData.filter((r) => r.id !== id);
  saveTableData(tableName, filtered, uid);
  return true;
};

// Find record by field for current user
export const findRecord = (tableName, field, value, userId = null) => {
  const tableData = getTableData(tableName, userId);
  return tableData.find((r) => r[field] === value);
};

// Generate next number for current user

export const generateNextNumber = (
  tableName,
  field,
  prefix = "",
  userId = null,
) => {
  const tableData = getTableData(tableName, userId);
  if (tableData.length === 0) {
    return `${prefix}100000001`;
  }
  
  const numbers = tableData
    .map((r) => {
      const value = r[field] || "";

      // Remove any letters at the beginning
      const numericPart = value.replace(/^\D+/, "");

      return parseInt(numericPart, 10);
    })
    .filter((n) => !isNaN(n));

  const maxNumber = numbers.length ? Math.max(...numbers) : 100000000;

  return `${prefix}${maxNumber + 1}`;
};

// Default data structure
const getDefaultData = () => ({
  materials: [],
  salesOrders: [],
  customers: [
    {
      id: "C001",
      customerNumber: "C001",
      name: "ABC Corporation",
      city: "New York",
      country: "USA",
      phone: "555-0101",
    },
    {
      id: "C002",
      customerNumber: "C002",
      name: "XYZ Industries",
      city: "Los Angeles",
      country: "USA",
      phone: "555-0102",
    },
    {
      id: "C003",
      customerNumber: "C003",
      name: "Global Traders",
      city: "Chicago",
      country: "USA",
      phone: "555-0103",
    },
    {
      id: "C004",
      customerNumber: "C004",
      name: "Tech Solutions Inc",
      city: "San Francisco",
      country: "USA",
      phone: "555-0104",
    },
    {
      id: "C005",
      customerNumber: "C005",
      name: "Prime Distributors",
      city: "Seattle",
      country: "USA",
      phone: "555-0105",
    },
  ],
  vendors: [
    {
      id: "V001",
      vendorNumber: "V001",
      name: "Supplier A",
      city: "Boston",
      country: "USA",
    },
    {
      id: "V002",
      vendorNumber: "V002",
      name: "Supplier B",
      city: "Denver",
      country: "USA",
    },
  ],
  plants: [
    { id: "1", plantCode: "1000", plantName: "Main Plant", city: "New York" },
    {
      id: "2",
      plantCode: "2000",
      plantName: "West Plant",
      city: "Los Angeles",
    },
    { id: "3", plantCode: "3000", plantName: "East Plant", city: "Chicago" },
  ],
  storageLocations: [
    { id: "1", sloc: "0001", name: "Main Storage", plantCode: "1000" },
    { id: "2", sloc: "0002", name: "Raw Materials", plantCode: "1000" },
    { id: "3", sloc: "0003", name: "Finished Goods", plantCode: "1000" },
  ],
  materialTypes: [
    { value: "FERT", label: "FERT - Finished Product" },
    { value: "HALB", label: "HALB - Semi-Finished Product" },
    { value: "ROH", label: "ROH - Raw Material" },
    { value: "HIBE", label: "HIBE - Operating Supplies" },
    { value: "VERP", label: "VERP - Packaging Material" },
  ],
  baseUnits: [
    { value: "EA", label: "EA - Each" },
    { value: "KG", label: "KG - Kilogram" },
    { value: "L", label: "L - Liter" },
    { value: "M", label: "M - Meter" },
    { value: "PC", label: "PC - Piece" },
    { value: "BOX", label: "BOX - Box" },
  ],
  materialGroups: [
    { value: "001", label: "001 - Electronics" },
    { value: "002", label: "002 - Mechanical Parts" },
    { value: "003", label: "003 - Chemicals" },
    { value: "004", label: "004 - Packaging" },
    { value: "005", label: "005 - Raw Materials" },
  ],
});

// Initialize data for a user
export const initializeUserData = (userId) => {
  const key = getUserStorageKey(userId);
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(getDefaultData()));
  }
};

// ========== USER MANAGEMENT (GLOBAL) ==========

// Get all users (global, not user-specific)
export const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
      const defaultUsers = createDefaultUsers();
      return defaultUsers;
    }
    return JSON.parse(users);
  } catch (error) {
    // console.error("Error reading users:", error);
    return createDefaultUsers();
  }
};

// Save users (global)
export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    // console.error("Error saving users:", error);
    return false;
  }
};

// Create and save default users
const createDefaultUsers = () => {
  const defaultUsers = [
    {
      id: "admin_001",
      username: "ADMIN",
      password: "admin123",
      firstName: "System",
      lastName: "Administrator",
      email: "admin@sapclone.com",
      role: "Admin",
      department: "IT",
      client: "001",
      language: "EN",
      dateFormat: "MM/DD/YYYY",
      decimalNotation: "1,234,567.89",
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      isLocked: false,
      failedAttempts: 0,
    },
    {
      id: "user_001",
      username: "SAPUSER",
      password: "welcome123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      role: "User",
      department: "Sales",
      client: "001",
      language: "EN",
      dateFormat: "MM/DD/YYYY",
      decimalNotation: "1,234,567.89",
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      isLocked: false,
      failedAttempts: 0,
    },
    {
      id: "user_002",
      username: "DEMO",
      password: "demo123",
      firstName: "Demo",
      lastName: "User",
      email: "demo@company.com",
      role: "User",
      department: "Purchasing",
      client: "001",
      language: "EN",
      dateFormat: "MM/DD/YYYY",
      decimalNotation: "1,234,567.89",
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      isLocked: false,
      failedAttempts: 0,
    },
  ];
  saveUsers(defaultUsers);
  return defaultUsers;
};

// Initialize users - FORCE reset to ensure admin exists
export const initializeUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    createDefaultUsers();
  } else {
    // Check if admin exists, if not add it
    const parsedUsers = JSON.parse(users);
    const adminExists = parsedUsers.some((u) => u.username === "ADMIN");
    if (!adminExists) {
      parsedUsers.unshift({
        id: "admin_001",
        username: "ADMIN",
        password: "admin123",
        firstName: "System",
        lastName: "Administrator",
        email: "admin@sapclone.com",
        role: "Admin",
        department: "IT",
        client: "001",
        language: "EN",
        dateFormat: "MM/DD/YYYY",
        decimalNotation: "1,234,567.89",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        isLocked: false,
        failedAttempts: 0,
      });
      saveUsers(parsedUsers);
    }
  }
};

// Reset users to default (utility function for debugging)
export const resetUsersToDefault = () => {
  localStorage.removeItem(USERS_KEY);
  return createDefaultUsers();
};

// Authenticate user
export const authenticateUser = (username, password) => {
  const users = getUsers();

  // console.log("Authenticating:", username); // Debug log
  // console.log(
  //   "Available users:",
  //   users.map((u) => u.username),
  // ); // Debug log

  const user = users.find(
    (u) => u.username.toUpperCase() === username.toUpperCase(),
  );

  if (!user) {
    // console.log("User not found"); // Debug log
    return { success: false, message: "User does not exist" };
  }

  if (!user.isActive) {
    return { success: false, message: "User account is deactivated" };
  }

  if (user.isLocked) {
    return {
      success: false,
      message: "User account is locked. Contact administrator.",
    };
  }

  // console.log("Checking password:", password, "vs", user.password); // Debug log

  if (user.password !== password) {
    // Increment failed attempts
    user.failedAttempts = (user.failedAttempts || 0) + 1;
    if (user.failedAttempts >= 5) {
      user.isLocked = true;
    }
    const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
    saveUsers(updatedUsers);

    return {
      success: false,
      message: user.isLocked
        ? "Account locked due to too many failed attempts"
        : `Invalid password. ${5 - user.failedAttempts} attempts remaining.`,
    };
  }

  // Successful login - reset failed attempts
  user.lastLogin = new Date().toISOString();
  user.failedAttempts = 0;
  const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
  saveUsers(updatedUsers);

  // Initialize user data if first login
  initializeUserData(user.id);

  // Create session (without password)
  // IMPORTANT: Check role to set isAdmin
  const isAdmin = user.role === "Admin";

  const session = {
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    department: user.department,
    client: user.client,
    loginTime: new Date().toISOString(),
    isAdmin: isAdmin, // This is critical!
  };

  // console.log("Login successful, isAdmin:", isAdmin); // Debug log

  return { success: true, user: session };
};

// Register new user
export const registerUser = (userData) => {
  const users = getUsers();

  // Check if username exists
  if (
    users.find(
      (u) => u.username.toUpperCase() === userData.username.toUpperCase(),
    )
  ) {
    return { success: false, message: "Username already exists" };
  }

  // Check if email exists
  if (
    users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())
  ) {
    return { success: false, message: "Email already registered" };
  }

  const newUser = {
    id: `user_${Date.now()}`,
    username: userData.username.toUpperCase(),
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    role: userData.role || "User", // Allow setting role if provided
    department: userData.department || "General",
    client: "001",
    language: "EN",
    dateFormat: "MM/DD/YYYY",
    decimalNotation: "1,234,567.89",
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isActive: true,
    isLocked: false,
    failedAttempts: 0,
  };

  users.push(newUser);
  saveUsers(users);

  // Initialize user data
  initializeUserData(newUser.id);

  return {
    success: true,
    message: "User registered successfully",
    user: newUser,
  };
};

// Update user (admin function)
export const updateUser = (userId, updates) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveUsers(users);
    return { success: true, user: users[index] };
  }

  return { success: false, message: "User not found" };
};

// Delete user (admin function)
export const deleteUser = (userId) => {
  const users = getUsers();

  // Prevent deleting the last admin
  const admins = users.filter((u) => u.role === "Admin");
  const userToDelete = users.find((u) => u.id === userId);

  if (userToDelete?.role === "Admin" && admins.length <= 1) {
    return { success: false, message: "Cannot delete the last admin user" };
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);

  // Also delete user's data
  const userDataKey = getUserStorageKey(userId);
  localStorage.removeItem(userDataKey);

  return { success: true, message: "User deleted successfully" };
};

// Reset user password (admin function)
export const resetUserPassword = (userId, newPassword) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  user.password = newPassword;
  user.isLocked = false;
  user.failedAttempts = 0;
  saveUsers(users);

  return { success: true, message: "Password reset successfully" };
};

// Unlock user (admin function)
export const unlockUser = (userId) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  user.isLocked = false;
  user.failedAttempts = 0;
  saveUsers(users);

  return { success: true, message: "User unlocked successfully" };
};

// ========== SESSION MANAGEMENT ==========

// Save session
export const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    return false;
  }
};

// Get current session
export const getSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    return null;
  }
};

// Clear session (logout)
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Update user profile
export const updateUserProfile = (userId, updates) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index !== -1) {
    // Don't allow changing role through profile update
    const { role, ...safeUpdates } = updates;
    users[index] = {
      ...users[index],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    saveUsers(users);
    return { success: true, user: users[index] };
  }

  return { success: false, message: "User not found" };
};

// Change password
export const changePassword = (userId, currentPassword, newPassword) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (user.password !== currentPassword) {
    return { success: false, message: "Current password is incorrect" };
  }

  user.password = newPassword;
  saveUsers(users);

  return { success: true, message: "Password changed successfully" };
};

// ========== FAVORITES ==========

// Get favorites for current user
export const getFavorites = (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    if (!uid) return [];

    const key = `${FAVORITES_KEY}_${uid}`;
    const favorites = localStorage.getItem(key);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    return [];
  }
};

// Save favorites for current user
export const saveFavorites = (favorites, userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    if (!uid) return false;

    const key = `${FAVORITES_KEY}_${uid}`;
    localStorage.setItem(key, JSON.stringify(favorites));
    return true;
  } catch (error) {
    return false;
  }
};

// Add to favorites
export const addToFavorites = (transaction, userId = null) => {
  const favorites = getFavorites(userId);

  // Check if already exists
  if (favorites.some((f) => f.tcode === transaction.tcode)) {
    return { success: false, message: "Already in favorites" };
  }

  favorites.push({
    ...transaction,
    addedAt: new Date().toISOString(),
  });

  saveFavorites(favorites, userId);
  return { success: true, message: "Added to favorites" };
};

// Remove from favorites
export const removeFromFavorites = (tcode, userId = null) => {
  const favorites = getFavorites(userId);
  const filtered = favorites.filter((f) => f.tcode !== tcode);
  saveFavorites(filtered, userId);
  return { success: true, message: "Removed from favorites" };
};

// Check if transaction is in favorites
export const isFavorite = (tcode, userId = null) => {
  const favorites = getFavorites(userId);
  return favorites.some((f) => f.tcode === tcode);
};

// ========== TRANSACTION HISTORY ==========

// Get transaction history for current user
export const getTransactionHistory = (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    if (!uid) return [];

    const key = `${HISTORY_KEY}_${uid}`;
    const history = localStorage.getItem(key);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    return [];
  }
};

// Save transaction history
export const saveTransactionHistory = (history, userId = null) => {
  try {
    const uid = userId || getCurrentUserId();
    if (!uid) return false;

    const key = `${HISTORY_KEY}_${uid}`;
    localStorage.setItem(key, JSON.stringify(history));
    return true;
  } catch (error) {
    return false;
  }
};

// Add to transaction history
export const addToHistory = (tcode, description = "", userId = null) => {
  const history = getTransactionHistory(userId);

  // Remove if already exists (to move to top)
  const filtered = history.filter((h) => h.tcode !== tcode);

  // Add to beginning
  filtered.unshift({
    tcode,
    description,
    accessedAt: new Date().toISOString(),
  });

  // Keep only last 20 entries
  const trimmed = filtered.slice(0, 20);

  saveTransactionHistory(trimmed, userId);
  return { success: true };
};

// Clear transaction history
export const clearTransactionHistory = (userId = null) => {
  const uid = userId || getCurrentUserId();
  if (!uid) return false;

  const key = `${HISTORY_KEY}_${uid}`;
  localStorage.removeItem(key);
  return true;
};

// ========== INITIALIZE ==========

// Initialize data (called on app start)
export const initializeData = () => {
  initializeUsers();
};

// ========== EXPENSE TRACKER ==========

// Get expense categories
export const getExpenseCategories = () => [
  { value: "food", label: "🍔 Food & Dining", color: "#e91e63" },
  { value: "travel", label: "✈️ Travel & Transport", color: "#9c27b0" },
  { value: "shopping", label: "🛍️ Shopping", color: "#3f51b5" },
  { value: "bills", label: "📄 Bills & Utilities", color: "#00bcd4" },
  { value: "entertainment", label: "🎬 Entertainment", color: "#ff9800" },
  { value: "healthcare", label: "🏥 Healthcare", color: "#4caf50" },
  { value: "education", label: "📚 Education", color: "#795548" },
  { value: "groceries", label: "🛒 Groceries", color: "#607d8b" },
  { value: "rent", label: "🏠 Rent & Housing", color: "#f44336" },
  { value: "insurance", label: "🛡️ Insurance", color: "#673ab7" },
  { value: "personal", label: "💄 Personal Care", color: "#e91e63" },
  { value: "gifts", label: "🎁 Gifts & Donations", color: "#ff5722" },
  { value: "investment", label: "📈 Investment", color: "#2196f3" },
  { value: "other", label: "📦 Other", color: "#9e9e9e" },
  { value: "alcohol", label: "🍺 Alcohol & Beverages", color: "#9c27b0" },
  { value: "cigarette-pan", label: "🚬 Cigarette & 🌿 Pan", color: "#795548" },
];

// Get payment methods
export const getPaymentMethods = () => [
  { value: "cash", label: "💵 Cash" },
  { value: "credit_card", label: "💳 Credit Card" },
  { value: "debit_card", label: "💳 Debit Card" },
  { value: "upi", label: "📱 UPI" },
  { value: "bank_transfer", label: "🏦 Bank Transfer" },
  { value: "cheque", label: "📝 Cheque" },
];

// Get expense statistics
export const getExpenseStats = (userId = null) => {
  const expenses = getTableData("expenses", userId);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // This month's expenses
  const thisMonthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  // Last month's expenses
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    return (
      date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    );
  });

  // This year's expenses
  const thisYearExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    return date.getFullYear() === currentYear;
  });

  // Calculate totals
  const totalThisMonth = thisMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0,
  );
  const totalLastMonth = lastMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0,
  );
  const totalThisYear = thisYearExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0,
  );
  const totalAllTime = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0,
  );

  // Category breakdown
  const categories = getExpenseCategories();
  const categoryBreakdown = categories
    .map((cat) => {
      const catExpenses = thisMonthExpenses.filter(
        (e) => e.category === cat.value,
      );
      const total = catExpenses.reduce(
        (sum, e) => sum + parseFloat(e.amount || 0),
        0,
      );
      return {
        ...cat,
        total,
        count: catExpenses.length,
        percentage:
          totalThisMonth > 0 ? Math.round((total / totalThisMonth) * 100) : 0,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentYear, currentMonth - i, 1);
    const monthExpenses = expenses.filter((e) => {
      const date = new Date(e.date);
      return (
        date.getMonth() === month.getMonth() &&
        date.getFullYear() === month.getFullYear()
      );
    });
    const total = monthExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount || 0),
      0,
    );
    monthlyTrend.push({
      month: month.toLocaleString("default", { month: "short" }),
      year: month.getFullYear(),
      total,
      count: monthExpenses.length,
    });
  }

  // Payment method breakdown
  const paymentMethods = getPaymentMethods();
  const paymentBreakdown = paymentMethods
    .map((method) => {
      const methodExpenses = thisMonthExpenses.filter(
        (e) => e.paymentMethod === method.value,
      );
      const total = methodExpenses.reduce(
        (sum, e) => sum + parseFloat(e.amount || 0),
        0,
      );
      return {
        ...method,
        total,
        count: methodExpenses.length,
        percentage:
          totalThisMonth > 0 ? Math.round((total / totalThisMonth) * 100) : 0,
      };
    })
    .filter((m) => m.total > 0)
    .sort((a, b) => b.total - a.total);

  // Recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // Month over month change
  const monthChange =
    totalLastMonth > 0
      ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
      : 0;

  return {
    totalThisMonth,
    totalLastMonth,
    totalThisYear,
    totalAllTime,
    expenseCount: expenses.length,
    thisMonthCount: thisMonthExpenses.length,
    monthChange,
    categoryBreakdown,
    monthlyTrend,
    paymentBreakdown,
    recentExpenses,
    averageExpense: expenses.length > 0 ? totalAllTime / expenses.length : 0,
  };
};
