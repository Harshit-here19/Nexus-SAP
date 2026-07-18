// src/components/Common/SapTable.jsx
import React, { useState, useMemo } from 'react';

const SapTable = ({
  columns = [],
  data = [],
  onRowClick,
  onRowDoubleClick,
  selectable = true,
  searchable = true,
  title = 'Data Table'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(col =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, columns]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowSelect = (index) => {
    if (!selectable) return;
    setSelectedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="sap-table-container">
      <div className="sap-table-toolbar">
        <div className="sap-table-toolbar-left">
          <span style={{ fontWeight: '600' }}>{title}</span>
          <span style={{ color: 'var(--sap-text-secondary)', fontSize: '12px' }}>
            ({filteredData.length} entries)
          </span>
        </div>
        <div className="sap-table-toolbar-right">
          {searchable && (
            <input
              type="text"
              className="sap-table-search"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="sap-table-wrapper">
        <table className="sap-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} onClick={() => handleSort(col.key)}>
                  {col.label}
                  <span className="sort-icon">{getSortIcon(col.key)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px' }}>
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={selectedRows.includes(rowIndex) ? 'selected' : ''}
                  onClick={() => {
                    handleRowSelect(rowIndex);
                    onRowClick && onRowClick(row, rowIndex);
                  }}
                  onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row, rowIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sap-table-footer">
        <span>Showing {filteredData.length} of {data.length} entries</span>
        <div className="sap-table-pagination">
          <button className="sap-button" disabled>⏮️</button>
          <button className="sap-button" disabled>◀️</button>
          <span style={{ padding: '0 12px' }}>Page 1 of 1</span>
          <button className="sap-button" disabled>▶️</button>
          <button className="sap-button" disabled>⏭️</button>
        </div>
      </div>
    </div>
  );
};

export default SapTable;