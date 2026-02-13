// src/components/Screens/DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import SapButton from '../Common/SapButton';
import { 
  getTableData, 
  getUsers,
  getExpenseCategories,
  getExpenseStats
} from '../../utils/storage';

const DashboardScreen = () => {
  const { navigateToTransaction, updateStatus } = useTransaction();
  const { user, checkIsAdmin } = useAuth();
  const { history, favorites } = useFavorites();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      const expenseStats = getExpenseStats();
      setStats(expenseStats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      updateStatus('Error loading dashboard data', 'error');
    }
    setLoading(false);
  };

  // Quick action handler
  const handleQuickAction = (tcode) => {
    navigateToTransaction(tcode);
  };

  // Format currency
  const formatCurrency = (value, compact = false) => {
    if (compact && value >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Calculate max for bar chart scaling
  const getMaxValue = (data) => {
    return Math.max(...data.map(d => d.total), 1);
  };

  // Pie chart colors
  const pieColors = ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#ff9800', '#4caf50', '#795548', '#607d8b'];

  // Generate pie chart gradient
  const generatePieChart = (data) => {
    if (!data || data.length === 0) return 'conic-gradient(#e5e5e5 0deg 360deg)';
    
    let gradient = 'conic-gradient(';
    let currentAngle = 0;
    
    data.forEach((item, index) => {
      const angle = (item.percentage / 100) * 360;
      const color = item.color || pieColors[index % pieColors.length];
      gradient += `${color} ${currentAngle}deg ${currentAngle + angle}deg`;
      currentAngle += angle;
      if (index < data.length - 1) gradient += ', ';
    });
    
    gradient += ')';
    return gradient;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="sap-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '6px',
        padding: '16px 20px',
        marginBottom: '12px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            💰 Expense Dashboard
          </h2>
          <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '12px' }}>
            Track and manage your expenses • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <SapButton onClick={() => handleQuickAction('VA01')} type="primary" icon="➕">
            Add Expense
          </SapButton>
          <SapButton onClick={loadDashboardData} icon="🔄">
            Refresh
          </SapButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        {/* This Month */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">This Month</span>
            <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              📅
            </div>
          </div>
          <div className="dashboard-card-value">{formatCurrency(stats?.totalThisMonth || 0)}</div>
          <div className={`dashboard-card-change ${stats?.monthChange >= 0 ? 'negative' : 'positive'}`}>
            <span>{stats?.monthChange >= 0 ? '↗' : '↘'}</span>
            {Math.abs(stats?.monthChange || 0)}% vs last month
          </div>
        </div>

        {/* Last Month */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Last Month</span>
            <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              📆
            </div>
          </div>
          <div className="dashboard-card-value">{formatCurrency(stats?.totalLastMonth || 0)}</div>
          <div className="dashboard-card-change">
            <span>📊</span> Comparison baseline
          </div>
        </div>

        {/* This Year */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">This Year</span>
            <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              📈
            </div>
          </div>
          <div className="dashboard-card-value">{formatCurrency(stats?.totalThisYear || 0, true)}</div>
          <div className="dashboard-card-change">
            <span>🗓️</span> Year to date
          </div>
        </div>

        {/* Average */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Average Expense</span>
            <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              📉
            </div>
          </div>
          <div className="dashboard-card-value">{formatCurrency(stats?.averageExpense || 0)}</div>
          <div className="dashboard-card-change">
            <span>📝</span> Per transaction
          </div>
        </div>

        {/* Total Expenses Count */}
        <div className="dashboard-card" onClick={() => handleQuickAction('VA03')} style={{ cursor: 'pointer' }}>
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Total Entries</span>
            <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              🧾
            </div>
          </div>
          <div className="dashboard-card-value">{stats?.expenseCount || 0}</div>
          <div className="dashboard-card-change">
            <span>📋</span> {stats?.thisMonthCount || 0} this month
          </div>
        </div>

        {/* All Time */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">All Time Total</span>
            <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
              💵
            </div>
          </div>
          <div className="dashboard-card-value">{formatCurrency(stats?.totalAllTime || 0, true)}</div>
          <div className="dashboard-card-change">
            <span>∞</span> Lifetime spending
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        {/* Expenses by Category */}
        <div className="chart-container">
          <div className="chart-title">
            <span>📊</span> Expenses by Category (This Month)
          </div>
          {stats?.categoryBreakdown?.length > 0 ? (
            <div className="pie-chart-container">
              <div 
                className="pie-chart"
                style={{ background: generatePieChart(stats.categoryBreakdown) }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'white',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--sap-text-secondary)' }}>Total</div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>{formatCurrency(stats.totalThisMonth, true)}</div>
                </div>
              </div>
              <div className="pie-chart-legend">
                {stats.categoryBreakdown.slice(0, 6).map((item, index) => (
                  <div key={index} className="pie-chart-legend-item">
                    <div 
                      className="pie-chart-legend-color"
                      style={{ background: item.color }}
                    />
                    <span className="pie-chart-legend-label">{item.label.split(' ').slice(1).join(' ')}</span>
                    <span className="pie-chart-legend-value">{formatCurrency(item.total)} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--sap-text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <div>No expenses this month</div>
              <SapButton 
                onClick={() => handleQuickAction('VA01')} 
                type="primary" 
                style={{ marginTop: '12px' }}
              >
                Record First Expense
              </SapButton>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="chart-container">
          <div className="chart-title">
            <span>📈</span> Monthly Trend (Last 6 Months)
          </div>
          {stats?.monthlyTrend?.length > 0 ? (
            <div className="bar-chart">
              {stats.monthlyTrend.map((item, index) => {
                const maxVal = getMaxValue(stats.monthlyTrend);
                const percentage = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
                return (
                  <div key={index} className="bar-chart-row">
                    <div className="bar-chart-label">{item.month}</div>
                    <div className="bar-chart-bar-container">
                      <div 
                        className="bar-chart-bar"
                        style={{ 
                          width: `${Math.max(percentage, 2)}%`,
                          background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`
                        }}
                      >
                        {percentage > 30 && formatCurrency(item.total, true)}
                      </div>
                    </div>
                    <div className="bar-chart-value">{formatCurrency(item.total, true)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--sap-text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <div>No trend data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px' }}>
        {/* Recent Expenses */}
        <div className="chart-container">
          <div className="chart-title">
            <span>🧾</span> Recent Expenses
          </div>
          {stats?.recentExpenses?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="sap-table" style={{ fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentExpenses.slice(0, 8).map((expense, index) => {
                    const category = getExpenseCategories().find(c => c.value === expense.category);
                    return (
                      <tr key={index}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            background: `${category?.color || '#9e9e9e'}20`,
                            borderRadius: '3px',
                            fontSize: '10px'
                          }}>
                            {category?.label?.split(' ')[0]} {expense.category}
                          </span>
                        </td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {expense.description}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '600', color: category?.color }}>
                          {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--sap-text-secondary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <div>No expenses recorded yet</div>
            </div>
          )}
          {stats?.recentExpenses?.length > 0 && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <SapButton onClick={() => handleQuickAction('VA03')} icon="👁️">
                View All Expenses
              </SapButton>
            </div>
          )}
        </div>

        {/* Quick Actions & Payment Methods */}
        <div className="chart-container">
          <div className="chart-title">
            <span>⚡</span> Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <SapButton onClick={() => handleQuickAction('VA01')} type="primary" icon="➕" style={{ justifyContent: 'flex-start' }}>
              Add Expense
            </SapButton>
            <SapButton onClick={() => handleQuickAction('VA02')} icon="✏️" style={{ justifyContent: 'flex-start' }}>
              Edit Expense
            </SapButton>
            <SapButton onClick={() => handleQuickAction('VA03')} icon="👁️" style={{ justifyContent: 'flex-start' }}>
              View Expenses
            </SapButton>
            <SapButton onClick={() => handleQuickAction('SE16')} icon="🔍" style={{ justifyContent: 'flex-start' }}>
              Data Browser
            </SapButton>
          </div>

          {/* Payment Methods Breakdown */}
          {stats?.paymentBreakdown?.length > 0 && (
            <>
              <div className="chart-title" style={{ marginTop: '16px' }}>
                <span>💳</span> Payment Methods (This Month)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.paymentBreakdown.slice(0, 5).map((method, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'var(--sap-content-bg)',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <span>{method.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--sap-text-secondary)', fontSize: '11px' }}>
                        {method.count} txn
                      </span>
                      <span style={{ fontWeight: '600' }}>
                        {formatCurrency(method.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Category Quick Stats */}
          <div className="chart-title" style={{ marginTop: '16px' }}>
            <span>🏷️</span> Top Categories
          </div>
          {stats?.categoryBreakdown?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {stats.categoryBreakdown.slice(0, 5).map((cat, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}40`,
                    borderRadius: '16px',
                    fontSize: '11px'
                  }}
                >
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: cat.color 
                  }} />
                  {cat.label.split(' ').slice(1).join(' ')}: {formatCurrency(cat.total, true)}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--sap-text-secondary)', fontSize: '12px' }}>
              No category data
            </div>
          )}
        </div>
      </div>

      {/* Admin Section */}
      {checkIsAdmin() && (
        <div className="chart-container" style={{ marginTop: '12px' }}>
          <div className="chart-title">
            <span>🔐</span> Admin Quick Access
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <SapButton onClick={() => handleQuickAction('ZADMIN')} icon="👥">
              User Management
            </SapButton>
            <SapButton onClick={() => handleQuickAction('SE16')} icon="🗄️">
              Data Browser
            </SapButton>
            <SapButton onClick={() => handleQuickAction('SU01')} icon="⚙️">
              Settings
            </SapButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;