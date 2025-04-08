import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui';
import { toast } from 'react-toastify';
import { useMutation, gql } from '@apollo/client';

// GraphQL mutation for updating user profile
const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: ID!, $input: UserProfileInput!) {
    updateUserProfile(userId: $userId, input: $input) {
      id
      name
      email
      phoneNumber
    }
  }
`;

// GraphQL mutation for updating notification settings
const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($userId: ID!, $input: NotificationSettingsInput!) {
    updateNotificationSettings(userId: $userId, input: $input) {
      id
      emailNotifications
      pushNotifications
      marketingCommunications
    }
  }
`;

// GraphQL mutation for changing password
const CHANGE_PASSWORD = gql`
  mutation ChangePassword($userId: ID!, $currentPassword: String!, $newPassword: String!) {
    changePassword(userId: $userId, currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export default function InvestorSettings() {
  const { user } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingCommunications: false,
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State for tracking which section is being edited
  const [editingSection, setEditingSection] = useState(null);
  
  // GraphQL mutations
  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_USER_PROFILE);
  const [updateNotifications, { loading: updatingNotifications }] = useMutation(UPDATE_NOTIFICATION_SETTINGS);
  const [changePassword, { loading: changingPassword }] = useMutation(CHANGE_PASSWORD);
  
  // Form handling functions
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  // Save functions
  const saveProfile = async () => {
    try {
      await updateProfile({
        variables: {
          userId: user.id,
          input: profile
        }
      });
      toast.success('Profile updated successfully');
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const saveNotificationSettings = async () => {
    try {
      await updateNotifications({
        variables: {
          userId: user.id,
          input: notificationSettings
        }
      });
      toast.success('Notification preferences updated');
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification preferences');
    }
  };
  
  const saveNewPassword = async () => {
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // Validate password strength
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      const result = await changePassword({
        variables: {
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      });
      
      if (result.data.changePassword.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setEditingSection(null);
      } else {
        toast.error(result.data.changePassword.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Account Settings</h1>
      
      {/* Profile Information */}
      <Card className="mb-6 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Profile Information</h2>
            <button 
              onClick={() => setEditingSection(editingSection === 'profile' ? null : 'profile')}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {editingSection === 'profile' ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {editingSection === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={updatingProfile}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Name</span>
                <span className="font-medium">{profile.name}</span>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Email</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">Phone Number</span>
                <span className="font-medium">{profile.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Notification Preferences */}
      <Card className="mb-6 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Notification Preferences</h2>
            <button 
              onClick={() => setEditingSection(editingSection === 'notifications' ? null : 'notifications')}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {editingSection === 'notifications' ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {editingSection === 'notifications' ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-slate-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="pushNotifications"
                  name="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-slate-700">
                  Push Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="marketingCommunications"
                  name="marketingCommunications"
                  checked={notificationSettings.marketingCommunications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="marketingCommunications" className="ml-2 block text-slate-700">
                  Marketing Communications
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={saveNotificationSettings}
                  disabled={updatingNotifications}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {updatingNotifications ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Email Notifications</span>
                <span className={`font-medium ${notificationSettings.emailNotifications ? 'text-green-600' : 'text-red-600'}`}>
                  {notificationSettings.emailNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Push Notifications</span>
                <span className={`font-medium ${notificationSettings.pushNotifications ? 'text-green-600' : 'text-red-600'}`}>
                  {notificationSettings.pushNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">Marketing Communications</span>
                <span className={`font-medium ${notificationSettings.marketingCommunications ? 'text-green-600' : 'text-red-600'}`}>
                  {notificationSettings.marketingCommunications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Security */}
      <Card className="bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Security</h2>
            <button 
              onClick={() => setEditingSection(editingSection === 'password' ? null : 'password')}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {editingSection === 'password' ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          
          {editingSection === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input 
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input 
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={saveNewPassword}
                  disabled={changingPassword}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Password</span>
                <span className="font-medium">••••••••</span>
              </div>
              
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Two-Factor Authentication</span>
                <span className="font-medium text-yellow-600">Not Enabled</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">Last Login</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 