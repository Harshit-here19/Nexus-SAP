// src/components/Screens/SalesOrderScreen.jsx
import React, { useState, useEffect } from 'react';
import SapInput from '../Common/SapInput';
import SapSelect from '../Common/SapSelect';
import SapButton from '../Common/SapButton';
import SapTabs from '../Common/SapTabs';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  getTableData,
  addRecord,
  updateRecord,
  findRecord,
  generateNextNumber
} from '../../utils/storage';

const SalesOrderScreen = ({ mode = 'create' }) => {
  const { updateStatus, markAsChanged, markAsSaved } = useTransaction();
  const { user } = useAuth();
  const {confirm} = useConfirm();
  
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLineIndex, setEditingLineIndex] = useState(null);

  // Header data
  const [headerData, setHeaderData] = useState({
    orderNumber: '',
    orderType: 'OR',
    salesOrg: '1000',
    distributionChannel: '10',
    division: '00',
    orderDate: new Date().toISOString().split('T')[0],
    customerNumber: '',
    customerName: '',
    customerCity: '',
    poNumber: '',
    poDate: '',
    requestedDeliveryDate: '',
    shippingCondition: '01',
    paymentTerms: 'NT30',
    incoterms: 'EXW',
    currency: 'INR',
    status: 'Open',
    createdBy: user?.username || 'SAPUSER',
    createdAt: new Date().toISOString()
  });

  // Line items
  const [lineItems, setLineItems] = useState([]);
  
  // Current line item being edited
  const [currentLine, setCurrentLine] = useState({
    itemNumber: '',
    materialNumber: '',
    description: '',
    quantity: '',
    unit: 'EA',
    unitPrice: '',
    discount: '0',
    netPrice: '',
    plant: '1000',
    storageLocation: '0001',
    deliveryDate: ''
  });

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Load master data
  useEffect(() => {
    setCustomers(getTableData('customers'));
    setMaterials(getTableData('materials'));
  }, []);

  // Calculate line item net price
  useEffect(() => {
    const quantity = parseFloat(currentLine.quantity) || 0;
    const unitPrice = parseFloat(currentLine.unitPrice) || 0;
    const discount = parseFloat(currentLine.discount) || 0;
    
    const gross = quantity * unitPrice;
    const discountAmount = gross * (discount / 100);
    const net = gross - discountAmount;
    
    setCurrentLine(prev => ({ ...prev, netPrice: net.toFixed(2) }));
  }, [currentLine.quantity, currentLine.unitPrice, currentLine.discount]);

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.netPrice || 0), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      itemCount: lineItems.length
    };
  };

  // Handle header change
  const handleHeaderChange = (field, value) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
    markAsChanged();
  };

  // Handle line item change
  const handleLineChange = (field, value) => {
    setCurrentLine(prev => ({ ...prev, [field]: value }));
  };

  // Add line item
  const handleAddLine = () => {
    if (!currentLine.materialNumber || !currentLine.quantity) {
      updateStatus('Please enter material and quantity', 'warning');
      return;
    }

    const newLine = {
      ...currentLine,
      itemNumber: ((lineItems.length + 1) * 10).toString().padStart(6, '0')
    };

    if (editingLineIndex !== null) {
      const updatedLines = [...lineItems];
      updatedLines[editingLineIndex] = newLine;
      setLineItems(updatedLines);
      setEditingLineIndex(null);
    } else {
      setLineItems(prev => [...prev, newLine]);
    }

    // Reset current line
    setCurrentLine({
      itemNumber: '',
      materialNumber: '',
      description: '',
      quantity: '',
      unit: 'EA',
      unitPrice: '',
      discount: '0',
      netPrice: '',
      plant: '1000',
      storageLocation: '0001',
      deliveryDate: ''
    });

    markAsChanged();
    updateStatus('Line item added', 'success');
  };

  // Edit line item
  const handleEditLine = (index) => {
    setCurrentLine(lineItems[index]);
    setEditingLineIndex(index);
  };

  // Delete line item
  const handleDeleteLine = async (index) => {
    const confirmed = await confirm('Delete this line item?');
    if (confirmed) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
      markAsChanged();
      updateStatus('Line item deleted', 'info');
    }
  };

  // Select customer
  const handleSelectCustomer = (customer) => {
    setHeaderData(prev => ({
      ...prev,
      customerNumber: customer.customerNumber || customer.id,
      customerName: customer.name,
      customerCity: customer.city
    }));
    setShowCustomerModal(false);
    markAsChanged();
  };

  // Select material
  const handleSelectMaterial = (material) => {
    setCurrentLine(prev => ({
      ...prev,
      materialNumber: material.materialNumber,
      description: material.description,
      unit: material.baseUnit || 'EA',
      unitPrice: material.salesPrice || '0'
    }));
    setShowMaterialModal(false);
  };

  // Load order
  const loadOrder = () => {
    if (!orderNumber.trim()) {
      updateStatus('Enter an order number', 'warning');
      return;
    }

    const order = findRecord('salesOrders', 'orderNumber', orderNumber.trim());
    if (order) {
      setHeaderData(order.header || order);
      setLineItems(order.items || []);
      setIsLoaded(true);
      updateStatus(`Order ${orderNumber} loaded successfully`, 'success');
    } else {
      updateStatus(`Order ${orderNumber} not found`, 'error');
    }
  };

  // Search orders
  const handleSearch = () => {
    const orders = getTableData('salesOrders');
    const results = orders.filter(o =>
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.header?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    setShowSearchModal(true);
  };

  // Select order from search
  const handleSelectOrder = (order) => {
    setOrderNumber(order.orderNumber);
    setHeaderData(order.header || order);
    setLineItems(order.items || []);
    setIsLoaded(true);
    setShowSearchModal(false);
    updateStatus(`Order ${order.orderNumber} selected`, 'success');
  };

  // Save order
  const handleSave = () => {
    // Validation
    if (!headerData.customerNumber) {
      updateStatus('Please select a customer', 'error');
      return;
    }

    if (lineItems.length === 0) {
      updateStatus('Please add at least one line item', 'error');
      return;
    }

    try {
      const totals = calculateTotals();
      const orderData = {
        orderNumber: headerData.orderNumber || generateNextNumber('salesOrders', 'orderNumber', 'SO'),
        header: {
          ...headerData,
          orderNumber: headerData.orderNumber || generateNextNumber('salesOrders', 'orderNumber', 'SO'),
          netValue: totals.subtotal,
          taxAmount: totals.tax,
          totalValue: totals.total
        },
        items: lineItems,
        totals
      };

      if (mode === 'create') {
        addRecord('salesOrders', orderData);
        setHeaderData(prev => ({ ...prev, orderNumber: orderData.orderNumber }));
        updateStatus(`Sales Order ${orderData.orderNumber} created successfully`, 'success');
      } else if (mode === 'change') {
        updateRecord('salesOrders', headerData.id, orderData);
        updateStatus(`Sales Order ${orderData.orderNumber} updated successfully`, 'success');
      }

      markAsSaved();
    } catch (error) {
      updateStatus(`Error saving order: ${error.message}`, 'error');
    }
  };

  // Clear form
  const handleClear = () => {
    setHeaderData({
      orderNumber: '',
      orderType: 'OR',
      salesOrg: '1000',
      distributionChannel: '10',
      division: '00',
      orderDate: new Date().toISOString().split('T')[0],
      customerNumber: '',
      customerName: '',
      customerCity: '',
      poNumber: '',
      poDate: '',
      requestedDeliveryDate: '',
      shippingCondition: '01',
      paymentTerms: 'NT30',
      incoterms: 'EXW',
      currency: 'INR',
      status: 'Open',
      createdBy: user?.username || 'SAPUSER',
      createdAt: new Date().toISOString()
    });
    setLineItems([]);
    setCurrentLine({
      itemNumber: '',
      materialNumber: '',
      description: '',
      quantity: '',
      unit: 'EA',
      unitPrice: '',
      discount: '0',
      netPrice: '',
      plant: '1000',
      storageLocation: '0001',
      deliveryDate: ''
    });
    setOrderNumber('');
    setIsLoaded(false);
    setErrors({});
    markAsSaved();
    updateStatus('Form cleared', 'info');
  };

  const isReadOnly = mode === 'display';
  const needsLoad = (mode === 'change' || mode === 'display') && !isLoaded;
  const totals = calculateTotals();

  // Header Tab
  const headerTab = (
    <div className="sap-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Order Data
          </h4>
          
          <SapInput
            label="Order Number"
            value={headerData.orderNumber}
            readOnly={true}
            placeholder="Auto-generated"
          />
          
          <SapSelect
            label="Order Type"
            value={headerData.orderType}
            onChange={(val) => handleHeaderChange('orderType', val)}
            options={[
              { value: 'OR', label: 'OR - Standard Order' },
              { value: 'SO', label: 'SO - Rush Order' },
              { value: 'RE', label: 'RE - Returns Order' }
            ]}
            disabled={isReadOnly}
          />
          
          <SapInput
            label="Order Date"
            value={headerData.orderDate}
            onChange={(val) => handleHeaderChange('orderDate', val)}
            type="date"
            disabled={isReadOnly}
          />
          
          <SapSelect
            label="Sales Organization"
            value={headerData.salesOrg}
            onChange={(val) => handleHeaderChange('salesOrg', val)}
            options={[
              { value: '1000', label: '1000 - US Sales Org' },
              { value: '2000', label: '2000 - EU Sales Org' }
            ]}
            disabled={isReadOnly}
          />
          
          <SapSelect
            label="Distribution Channel"
            value={headerData.distributionChannel}
            onChange={(val) => handleHeaderChange('distributionChannel', val)}
            options={[
              { value: '10', label: '10 - Direct Sales' },
              { value: '20', label: '20 - Wholesale' }
            ]}
            disabled={isReadOnly}
          />
        </div>

        {/* Right Column - Customer */}
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span> Customer Data
          </h4>
          
          <div className="sap-form-group">
            <label className="sap-form-label required">Customer</label>
            <div className="sap-form-field" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="sap-input"
                value={headerData.customerNumber}
                onChange={(e) => handleHeaderChange('customerNumber', e.target.value)}
                placeholder="Customer number"
                disabled={isReadOnly}
                style={{ width: '120px' }}
              />
              <input
                type="text"
                className="sap-input"
                value={headerData.customerName}
                readOnly
                placeholder="Customer name"
                style={{ flex: 1 }}
              />
              {!isReadOnly && (
                <SapButton onClick={() => setShowCustomerModal(true)} icon="🔍">
                  Search
                </SapButton>
              )}
            </div>
          </div>
          
          <SapInput
            label="City"
            value={headerData.customerCity}
            readOnly={true}
          />
          
          <SapInput
            label="PO Number"
            value={headerData.poNumber}
            onChange={(val) => handleHeaderChange('poNumber', val)}
            disabled={isReadOnly}
            placeholder="Customer PO reference"
          />
          
          <SapInput
            label="PO Date"
            value={headerData.poDate}
            onChange={(val) => handleHeaderChange('poDate', val)}
            type="date"
            disabled={isReadOnly}
          />
          
          <SapInput
            label="Requested Delivery"
            value={headerData.requestedDeliveryDate}
            onChange={(val) => handleHeaderChange('requestedDeliveryDate', val)}
            type="date"
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );

  // Items Tab
  const itemsTab = (
    <div>
      {/* Add Item Form */}
      {!isReadOnly && (
        <div style={{
          background: 'var(--sap-content-bg)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingLineIndex !== null ? '✏️ Edit Item' : '➕ Add Item'}
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px 100px 100px 100px', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Material</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  className="sap-input"
                  value={currentLine.materialNumber}
                  onChange={(e) => handleLineChange('materialNumber', e.target.value)}
                  placeholder="Material"
                  style={{ width: '100%' }}
                />
                <button
                  className="sap-toolbar-button"
                  onClick={() => setShowMaterialModal(true)}
                  title="Search Material"
                >
                  🔍
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
              <input
                type="text"
                className="sap-input"
                value={currentLine.description}
                onChange={(e) => handleLineChange('description', e.target.value)}
                placeholder="Description"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Quantity</label>
              <SapInput
                type="number"
                className="sap-input"
                value={currentLine.quantity}
                onChange={(val) => handleLineChange('quantity', val)}
                placeholder="Qty"
                min="1"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Unit Price</label>
              <SapInput
                type="number"
                className="sap-input"
                value={currentLine.unitPrice}
                onChange={(val) => handleLineChange('unitPrice', val)}
                placeholder="Price"
                step="0.01"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Discount %</label>
              <SapInput
                type="number"
                className="sap-input"
                value={currentLine.discount}
                onChange={(val) => handleLineChange('discount', val)}
                placeholder="%"
                min="0"
                max="100"
              />
            </div>
            <div>
              <SapButton onClick={handleAddLine} type="primary" icon={editingLineIndex !== null ? '✓' : '➕'}>
                {editingLineIndex !== null ? 'Update' : 'Add'}
              </SapButton>
            </div>
          </div>
          
          {currentLine.netPrice && parseFloat(currentLine.netPrice) > 0 && (
            <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '14px' }}>
              <strong>Net Price: {headerData.currency} {currentLine.netPrice}</strong>
            </div>
          )}
        </div>
      )}

      {/* Items Table */}
      <div className="sap-table-container">
        <table className="sap-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Item</th>
              <th style={{ width: '120px' }}>Material</th>
              <th>Description</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Quantity</th>
              <th style={{ width: '60px' }}>Unit</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Unit Price</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Discount</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Net Price</th>
              {!isReadOnly && <th style={{ width: '100px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan={isReadOnly ? 8 : 9} style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--sap-text-secondary)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                    No items added yet
                  </div>
                </td>
              </tr>
            ) : (
              lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemNumber}</td>
                  <td>{item.materialNumber}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td style={{ textAlign: 'right' }}>{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{item.discount}%</td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    {headerData.currency} {parseFloat(item.netPrice).toFixed(2)}
                  </td>
                  {!isReadOnly && (
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="sap-toolbar-button"
                          onClick={() => handleEditLine(index)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="sap-toolbar-button"
                          onClick={() => handleDeleteLine(index)}
                          title="Delete"
                          style={{ color: 'var(--sap-negative)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {lineItems.length > 0 && (
            <tfoot>
              <tr style={{ background: 'var(--sap-content-bg)' }}>
                <td colSpan={isReadOnly ? 6 : 7} style={{ textAlign: 'right', fontWeight: '600' }}>
                  Subtotal ({totals.itemCount} items):
                </td>
                <td colSpan={2} style={{ textAlign: 'right', fontWeight: '600' }}>
                  {headerData.currency} {totals.subtotal}
                </td>
              </tr>
              <tr style={{ background: 'var(--sap-content-bg)' }}>
                <td colSpan={isReadOnly ? 6 : 7} style={{ textAlign: 'right' }}>
                  Tax (10%):
                </td>
                <td colSpan={2} style={{ textAlign: 'right' }}>
                  {headerData.currency} {totals.tax}
                </td>
              </tr>
              <tr style={{ background: 'var(--sap-brand)', color: 'white' }}>
                <td colSpan={isReadOnly ? 6 : 7} style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px' }}>
                  Total:
                </td>
                <td colSpan={2} style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px' }}>
                  {headerData.currency} {totals.total}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );

  // Shipping Tab
  const shippingTab = (
    <div className="sap-form">
      <SapSelect
        label="Shipping Condition"
        value={headerData.shippingCondition}
        onChange={(val) => handleHeaderChange('shippingCondition', val)}
        options={[
          { value: '01', label: '01 - Standard Delivery' },
          { value: '02', label: '02 - Express Delivery' },
          { value: '03', label: '03 - Pickup' }
        ]}
        disabled={isReadOnly}
      />
      
      <SapSelect
        label="Incoterms"
        value={headerData.incoterms}
        onChange={(val) => handleHeaderChange('incoterms', val)}
        options={[
          { value: 'EXW', label: 'EXW - Ex Works' },
          { value: 'FOB', label: 'FOB - Free on Board' },
          { value: 'CIF', label: 'CIF - Cost, Insurance, Freight' },
          { value: 'DDP', label: 'DDP - Delivered Duty Paid' }
        ]}
        disabled={isReadOnly}
      />
    </div>
  );

  // Billing Tab
  const billingTab = (
    <div className="sap-form">
      <SapSelect
        label="Payment Terms"
        value={headerData.paymentTerms}
        onChange={(val) => handleHeaderChange('paymentTerms', val)}
        options={[
          { value: 'NT00', label: 'NT00 - Immediate Payment' },
          { value: 'NT15', label: 'NT15 - Net 15 Days' },
          { value: 'NT30', label: 'NT30 - Net 30 Days' },
          { value: 'NT60', label: 'NT60 - Net 60 Days' }
        ]}
        disabled={isReadOnly}
      />
      
      <SapSelect
        label="Currency"
        value={headerData.currency}
        onChange={(val) => handleHeaderChange('currency', val)}
        options={[
          { value: 'USD', label: 'USD - US Dollar' },
          { value: 'EUR', label: 'EUR - Euro' },
          { value: 'GBP', label: 'GBP - British Pound' },
          { value: 'INR', label: 'INR - Indian Rupee' }
        ]}
        disabled={isReadOnly}
      />

      {/* Order Summary */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'var(--sap-content-bg)',
        borderRadius: '8px',
        border: '1px solid var(--sap-border)'
      }}>
        <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)' }}>💰 Order Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <span style={{ color: 'var(--sap-text-secondary)' }}>Items:</span>
            <strong style={{ marginLeft: '8px' }}>{totals.itemCount}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--sap-text-secondary)' }}>Subtotal:</span>
            <strong style={{ marginLeft: '8px' }}>{headerData.currency} {totals.subtotal}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--sap-text-secondary)' }}>Tax:</span>
            <strong style={{ marginLeft: '8px' }}>{headerData.currency} {totals.tax}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--sap-text-secondary)' }}>Total:</span>
            <strong style={{ marginLeft: '8px', color: 'var(--sap-brand)', fontSize: '16px' }}>
              {headerData.currency} {totals.total}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Status Tab
  const statusTab = (
    <div className="sap-form">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)' }}>📊 Order Status</h4>
          <SapSelect
            label="Status"
            value={headerData.status}
            onChange={(val) => handleHeaderChange('status', val)}
            options={[
              { value: 'Open', label: 'Open' },
              { value: 'In Process', label: 'In Process' },
              { value: 'Delivered', label: 'Delivered' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
            disabled={isReadOnly}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '16px', color: 'var(--sap-brand)' }}>📝 Administrative Data</h4>
          <SapInput
            label="Created By"
            value={headerData.createdBy}
            readOnly={true}
          />
          <SapInput
            label="Created On"
            value={headerData.createdAt ? new Date(headerData.createdAt).toLocaleString() : ''}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: 'Header Data', icon: '📋', content: headerTab },
    { label: 'Line Items', icon: '📦', content: itemsTab },
    { label: 'Shipping', icon: '🚚', content: shippingTab },
    { label: 'Billing', icon: '💳', content: billingTab },
    { label: 'Status', icon: '📊', content: statusTab }
  ];

  const getModeTitle = () => {
    switch (mode) {
      case 'create': return 'Create Sales Order';
      case 'change': return 'Change Sales Order';
      case 'display': return 'Display Sales Order';
      default: return 'Sales Order';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'create': return '➕';
      case 'change': return '✏️';
      case 'display': return '👁️';
      default: return '🛒';
    }
  };

  return (
    <div>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">{getModeIcon()}</span>
            {getModeTitle()} - VA0{mode === 'create' ? '1' : mode === 'change' ? '2' : '3'}
          </span>
          <div className="sap-panel-header-actions">
            <span className={`sap-badge ${mode === 'create' ? 'info' : mode === 'change' ? 'warning' : 'success'}`}>
              {mode.toUpperCase()}
            </span>
            {lineItems.length > 0 && (
              <span className="sap-badge info" style={{ marginLeft: '8px' }}>
                {totals.itemCount} items | {headerData.currency} {totals.total}
              </span>
            )}
          </div>
        </div>
        <div className="sap-panel-content">
          {needsLoad ? (
            <div>
              <div className="sap-message-strip info" style={{ marginBottom: '20px' }}>
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>Enter an order number to load or search for existing orders.</span>
              </div>
              
              <div className="sap-form-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <SapInput
                  label="Sales Order Number"
                  value={orderNumber}
                  onChange={setOrderNumber}
                  placeholder="Enter order number"
                />
                <SapButton onClick={loadOrder} type="primary" icon="📂">
                  Load
                </SapButton>
                <SapButton onClick={() => setShowSearchModal(true)} icon="🔎">
                  Search
                </SapButton>
              </div>
            </div>
          ) : (
            <>
              <div className="sap-button-group" style={{ marginBottom: '20px' }}>
                {!isReadOnly && (
                  <SapButton onClick={handleSave} type="primary" icon="💾">
                    Save
                  </SapButton>
                )}
                <SapButton onClick={handleClear} icon="🗑️">
                  Clear
                </SapButton>
              </div>

              <SapTabs tabs={tabs} defaultTab={1} />
            </>
          )}
        </div>
      </div>

      {/* Customer Search Modal */}
      <SapModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="🔍 Search Customers"
        width="600px"
      >
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="sap-input"
            placeholder="Search by customer number or name..."
            onChange={(e) => {
              const term = e.target.value.toLowerCase();
              // Filter from sample customers if no customer data exists
              const sampleCustomers = customers.length > 0 ? customers : [
                { id: 'C001', customerNumber: 'C001', name: 'ABC Corporation', city: 'New York', country: 'USA' },
                { id: 'C002', customerNumber: 'C002', name: 'XYZ Industries', city: 'Los Angeles', country: 'USA' },
                { id: 'C003', customerNumber: 'C003', name: 'Global Traders', city: 'Chicago', country: 'USA' }
              ];
              setSearchResults(sampleCustomers.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.customerNumber?.toLowerCase().includes(term)
              ));
            }}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Name</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(searchResults.length > 0 ? searchResults : [
                { id: 'C001', customerNumber: 'C001', name: 'ABC Corporation', city: 'New York' },
                { id: 'C002', customerNumber: 'C002', name: 'XYZ Industries', city: 'Los Angeles' },
                { id: 'C003', customerNumber: 'C003', name: 'Global Traders', city: 'Chicago' }
              ]).map((customer, index) => (
                <tr key={index}>
                  <td>{customer.customerNumber || customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.city}</td>
                  <td>
                    <SapButton onClick={() => handleSelectCustomer(customer)} type="primary">
                      Select
                    </SapButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SapModal>

      {/* Material Search Modal */}
      <SapModal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title="🔍 Search Materials"
        width="700px"
      >
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="sap-input"
            placeholder="Search by material number or description..."
            onChange={(e) => {
              const term = e.target.value.toLowerCase();
              const allMaterials = getTableData('materials');
              setSearchResults(allMaterials.filter(m =>
                m.materialNumber?.toLowerCase().includes(term) ||
                m.description?.toLowerCase().includes(term)
              ));
            }}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Description</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(searchResults.length > 0 ? searchResults : getTableData('materials')).map((material, index) => (
                <tr key={index}>
                  <td>{material.materialNumber}</td>
                  <td>{material.description}</td>
                  <td>{material.salesPrice || '0.00'}</td>
                  <td>{material.baseUnit || 'EA'}</td>
                  <td>
                    <SapButton onClick={() => handleSelectMaterial(material)} type="primary">
                      Select
                    </SapButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SapModal>

      {/* Order Search Modal */}
      <SapModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="🔍 Search Sales Orders"
        width="700px"
      >
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="sap-input"
            placeholder="Search by order number or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const orders = getTableData('salesOrders');
              const results = orders.filter(o =>
                o.orderNumber?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                o.header?.customerName?.toLowerCase().includes(e.target.value.toLowerCase())
              );
              setSearchResults(results);
            }}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                searchResults.map((order, index) => (
                  <tr key={index}>
                    <td>{order.orderNumber}</td>
                    <td>{order.header?.customerName}</td>
                    <td>{order.header?.orderDate}</td>
                    <td>{order.totals?.total}</td>
                    <td>
                      <span className={`sap-badge ${order.header?.status === 'Open' ? 'info' : 'success'}`}>
                        {order.header?.status}
                      </span>
                    </td>
                    <td>
                      <SapButton onClick={() => handleSelectOrder(order)} type="primary">
                        Select
                      </SapButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SapModal>
    </div>
  );
};

export default SalesOrderScreen;