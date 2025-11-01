import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CommandLineIcon, 
  TableCellsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import './QueryExecutor.css';

const QueryExecutor = () => {
  const [selectedQuery, setSelectedQuery] = useState('select_all_guests');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [sortBy, setSortBy] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  
  // Custom SQL Query Mode
  const [queryMode, setQueryMode] = useState('predefined'); // 'predefined' or 'custom'
  const [customSQL, setCustomSQL] = useState('');
  const [selectedQueryType, setSelectedQueryType] = useState('SELECT');

  // Available queries with their descriptions
  const queryOptions = [
    { value: 'select_all_guests', label: 'All Guests', sortOptions: ['guest_id', 'full_name', 'email', 'phone_number'] },
    { value: 'select_all_rooms', label: 'All Rooms', sortOptions: ['room_id', 'room_number', 'room_type', 'monthly_rent', 'occupancy_status'] },
    { value: 'select_all_bookings', label: 'All Bookings', sortOptions: ['booking_id', 'guest_id', 'room_id', 'check_in_date', 'check_out_date', 'booking_status'] },
    { value: 'select_all_payments', label: 'All Payments', sortOptions: ['payment_id', 'booking_id', 'amount_paid', 'payment_date', 'payment_method'] },
    { value: 'select_all_maintenance', label: 'All Maintenance Records', sortOptions: ['request_id', 'room_id', 'reported_date', 'status'] },
    { value: 'guests_with_active_bookings', label: 'Guests with Active Bookings', sortOptions: [] },
    { value: 'available_rooms', label: 'Available Rooms', sortOptions: ['room_id', 'room_number', 'room_type', 'monthly_rent'] },
    { value: 'occupied_rooms', label: 'Occupied Rooms', sortOptions: ['room_id', 'room_number', 'room_type', 'monthly_rent'] },
    { value: 'recent_payments', label: 'Recent Payments', sortOptions: [] },
    { value: 'pending_maintenance', label: 'Pending Maintenance', sortOptions: [] },
  ];

  const currentQueryOption = queryOptions.find(q => q.value === selectedQuery);

  // Sample SQL queries for different operations
  const sampleQueries = {
    SELECT: "SELECT * FROM Guests WHERE email LIKE '%@gmail.com%' ORDER BY full_name ASC",
    SELECT_WHERE: "SELECT * FROM Rooms WHERE occupancy_status = 'Available' AND monthly_rent < 10000",
    SELECT_JOIN: "SELECT g.full_name, g.phone_number, b.check_in_date, b.check_out_date, r.room_number FROM Guests g INNER JOIN Bookings b ON g.guest_id = b.guest_id INNER JOIN Rooms r ON b.room_id = r.room_id WHERE b.booking_status = 'Active'",
    GROUP_BY: "SELECT room_type, COUNT(*) as count, AVG(monthly_rent) as avg_rent FROM Rooms GROUP BY room_type",
    ORDER_BY: "SELECT * FROM Payments ORDER BY payment_date DESC, amount_paid DESC LIMIT 10",
    DESCRIBE: "DESC Guests",
    SHOW_TABLES: "SHOW TABLES",
    INSERT: "INSERT INTO Guests (full_name, phone_number, email, id_proof_type, id_proof_number, address) VALUES ('John Doe', '9876543210', 'john@example.com', 'Aadhar', '1234-5678-9012', '123 Main St')",
    UPDATE: "UPDATE Guests SET phone_number = '9999999999', email = 'newemail@example.com' WHERE guest_id = 1",
    DELETE: "DELETE FROM Guests WHERE guest_id = 999"
  };

  const executeQuery = async () => {
    setLoading(true);
    setError('');
    const startTime = Date.now();
    
    try {
      let response;
      
      if (queryMode === 'custom') {
        // Execute custom SQL
        if (!customSQL.trim()) {
          throw new Error('Please enter a SQL query');
        }
        
        response = await fetch('http://localhost:8000/api/execute-sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            sql_query: customSQL,
            query_type: selectedQueryType
          })
        });
      } else {
        // Execute predefined query
        response = await fetch('http://localhost:8000/api/query-executor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            query_type: selectedQuery,
            sort_order: sortOrder,
            sort_by: sortBy || undefined
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to execute query');
      }

      const data = await response.json();
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setQueryResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="query-executor-container">
      <div className="animated-background"></div>
      <motion.div
        className="min-h-screen p-6 lg:ml-72 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Header */}
        <motion.div 
          className="mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="query-executor-title">
                SQL Query Executor
              </h1>
              <p className="query-executor-subtitle">
                Execute powerful database queries with real-time results
              </p>
            </div>
            
            {executionTime && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="execution-time-badge"
              >
                <div className="pulse-ring"></div>
                <div>
                  <p className="text-xs text-white font-medium opacity-80">Execution Time</p>
                  <p className="text-lg font-bold text-white">{executionTime}ms</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Query Configuration Card */}
        <motion.div
          className="config-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="config-header">
          <h2 className="config-title">Query Configuration</h2>
          <div className="config-title-underline"></div>
        </div>

        {/* Query Mode Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => {
                setQueryMode('predefined');
                setError('');
                setQueryResult(null);
              }}
              className={`px-6 py-4 rounded-xl font-bold transition-all ${
                queryMode === 'predefined'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📋 Predefined Queries
            </motion.button>
            <motion.button
              onClick={() => {
                setQueryMode('custom');
                setError('');
                setQueryResult(null);
              }}
              className={`px-6 py-4 rounded-xl font-bold transition-all ${
                queryMode === 'custom'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-emerald-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ⚡ Custom SQL
            </motion.button>
          </div>
        </div>

        {queryMode === 'predefined' ? (
          <div className="space-y-4">
            {/* Horizontal Input Fields Layout */}
            <div className="grid grid-cols-3 gap-4">
              {/* Query Type Selector */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Query Type
                </label>
                <select
                  value={selectedQuery}
                  onChange={(e) => {
                    setSelectedQuery(e.target.value);
                    setSortBy('');
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {queryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Selector */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentQueryOption?.sortOptions.length}
                >
                  <option value="">Default Sorting</option>
                  {currentQueryOption?.sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order Selector */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          // Custom SQL Mode
          <div className="space-y-4">
            {/* Query Type Selector for Custom SQL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Query Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['SELECT', 'INSERT', 'UPDATE', 'DELETE'].map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setSelectedQueryType(type)}
                    className={`px-4 py-3 rounded-lg font-bold transition-all ${
                      selectedQueryType === type
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-emerald-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sample Queries */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sample Queries (Click to use)
              </label>
              <div className="space-y-2">
                {Object.entries(sampleQueries).map(([key, query]) => (
                  <motion.button
                    key={key}
                    onClick={() => setCustomSQL(query)}
                    className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-sm text-gray-700 transition-all"
                    whileHover={{ x: 5 }}
                  >
                    <span className="font-semibold text-indigo-600">{key}:</span> {query.substring(0, 80)}...
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom SQL Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                SQL Query
              </label>
              <textarea
                value={customSQL}
                onChange={(e) => setCustomSQL(e.target.value)}
                placeholder="Enter your SQL query here... (e.g., SELECT * FROM Guests WHERE email LIKE '%@gmail.com%')"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 font-mono text-sm min-h-[150px] resize-y"
                style={{ fontFamily: 'Monaco, Courier New, monospace' }}
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Tip: You can use WHERE, ORDER BY, GROUP BY, JOIN, and other SQL clauses
              </p>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <motion.button
          onClick={executeQuery}
          disabled={loading}
          className={`execute-button ${loading ? 'loading' : ''}`}
          whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-3">
              <div className="spinner"></div>
              <span>Executing Query...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>Execute Query</span>
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="error-message"
          >
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query Display & Results */}
      <AnimatePresence>
        {queryResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* SQL Query Display */}
            <motion.div 
              className="sql-display-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="sql-header">
                <h3 className="sql-title">Executed SQL Query</h3>
                <div className="sql-decoration"></div>
              </div>
              <pre className="sql-code">
                {queryResult.query}
              </pre>
            </motion.div>

            {/* Results Table */}
            <motion.div 
              className="results-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="results-header">
                <div className="results-title-wrapper">
                  <h3 className="results-title">
                    {queryResult.query_type && queryResult.query_type !== 'SELECT' 
                      ? `${queryResult.query_type} Result` 
                      : 'Query Results'}
                  </h3>
                  <div className="results-underline"></div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="row-count-badge"
                >
                  <span className="row-count-text">
                    {queryResult.query_type === 'SELECT' || !queryResult.query_type
                      ? `${queryResult.results.length} rows`
                      : `${queryResult.affected_rows} affected`}
                  </span>
                </motion.div>
              </div>
              
              {/* Success message for INSERT/UPDATE/DELETE */}
              {queryResult.message && (
                <div className="p-6 bg-green-50 border-l-4 border-green-500 mb-4">
                  <p className="text-green-800 font-semibold">✅ {queryResult.message}</p>
                  {queryResult.affected_rows > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      {queryResult.affected_rows} row(s) affected
                    </p>
                  )}
                </div>
              )}
              
              <div className="table-wrapper">
                {queryResult.results && queryResult.results.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        {queryResult.columns.map((column, idx) => (
                          <th
                            key={column}
                            onClick={() => {
                              if (queryMode === 'predefined' && currentQueryOption?.sortOptions.includes(column)) {
                                setSortBy(column);
                                setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                executeQuery();
                              }
                            }}
                            className="table-header"
                          >
                            <div className="header-content">
                              <span>{column.replace(/_/g, ' ')}</span>
                              {queryMode === 'predefined' && currentQueryOption?.sortOptions.includes(column) && sortBy === column && (
                                <span className="sort-indicator">
                                  {sortOrder === 'ASC' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.results.map((row, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="table-row"
                        >
                          {queryResult.columns.map((column) => (
                            <td
                              key={column}
                              className="table-cell"
                            >
                              {row[column] !== null && row[column] !== undefined
                                ? String(row[column])
                                : '-'}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p className="empty-state-text">No Results Found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default QueryExecutor;
