import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/formatters';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'lastLogin', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'investor',
    status: 'active'
  });
  
  // Mock data for demonstration
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockUsers = [
          {
            id: 'user1',
            email: 'john.smith@example.com',
            firstName: 'John',
            lastName: 'Smith',
            role: 'admin',
            status: 'active',
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'user2',
            email: 'sarah.johnson@example.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'manager',
            status: 'active',
            lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'user3',
            email: 'michael.brown@example.com',
            firstName: 'Michael',
            lastName: 'Brown',
            role: 'investor',
            status: 'active',
            lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'user4',
            email: 'emma.wilson@example.com',
            firstName: 'Emma',
            lastName: 'Wilson',
            role: 'investor',
            status: 'active',
            lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'user5',
            email: 'david.lee@example.com',
            firstName: 'David',
            lastName: 'Lee',
            role: 'investor',
            status: 'inactive',
            lastLogin: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'user6',
            email: 'olivia.martin@example.com',
            firstName: 'Olivia',
            lastName: 'Martin',
            role: 'investor',
            status: 'inactive',
            lastLogin: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'user7',
            email: 'james.wilson@example.com',
            firstName: 'James',
            lastName: 'Wilson',
            role: 'auditor',
            status: 'active',
            lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            created: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
          },
        ];
        
        setUsers(mockUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted and filtered data
  const getSortedUsers = () => {
    let filteredUsers = [...users];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(query) || 
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredUsers;
  };
  
  const sortedAndFilteredUsers = getSortedUsers();
  
  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    });
    setIsCreatingUser(false);
    setIsModalOpen(true);
  };
  
  // Handle create new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'investor',
      status: 'active'
    });
    setIsCreatingUser(true);
    setIsModalOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isCreatingUser) {
        // Create new user
        const newUser = {
          id: `user${users.length + 1}`,
          ...formData,
          lastLogin: null,
          created: new Date().toISOString()
        };
        
        setUsers([...users, newUser]);
      } else {
        // Update existing user
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...formData }
            : user
        ));
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    }
  };
  
  // Header for sortable columns
  const SortableHeader = ({ children, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 select-none"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {isSorted && (
            <span>
              {sortConfig.direction === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </span>
          )}
        </div>
      </th>
    );
  };
  
  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'auditor':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  // Modal component
  const UserModal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isCreatingUser ? 'Create New User' : 'Edit User'}
                </h3>
              </div>
              
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="investor">Investor</option>
                      <option value="manager">Fund Manager</option>
                      <option value="auditor">Auditor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                {isCreatingUser && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-lg">
                    A temporary password will be generated and sent to the user's email.
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors"
                >
                  {isCreatingUser ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          User Management
        </h2>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex space-x-2">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="manager">Fund Managers</option>
              <option value="auditor">Auditors</option>
              <option value="investor">Investors</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-red-500 dark:text-red-400">{error}</div>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : sortedAndFilteredUsers.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No users match your search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <SortableHeader sortKey="firstName">User</SortableHeader>
                <SortableHeader sortKey="email">Email</SortableHeader>
                <SortableHeader sortKey="role">Role</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="lastLogin">Last Login</SortableHeader>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAndFilteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created on {formatDate(new Date(user.created))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin ? formatDate(new Date(user.lastLogin)) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Reset Password"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold">{sortedAndFilteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> users
          </div>
          <button
            onClick={handleCreateUser}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-dark transition-colors text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New User
          </button>
        </div>
      </div>
      
      <UserModal />
    </div>
  );
};

export default AdminUserManagement; 