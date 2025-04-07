import React, { useState } from 'react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Franklin Templeton Tokenized Fund Platform',
    supportEmail: 'support@franklintempleton.com',
    dataRefreshInterval: '30',
    maintenanceMode: false,
    debugMode: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    requireTwoFactor: true,
    passwordExpiration: '90',
    ipRestriction: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.franklintempleton.com',
    smtpPort: '587',
    emailFrom: 'noreply@franklintempleton.com',
    useTLS: true,
    emailTemplatesEnabled: true
  });
  
  const [navUpdateSettings, setNavUpdateSettings] = useState({
    autoUpdateEnabled: true,
    updateFrequency: 'hourly',
    allowManualOverride: true,
    requireJustification: true,
    notifyOnChange: true
  });
  
  const [activeSection, setActiveSection] = useState('general');
  
  const handleGeneralSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSecuritySettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleEmailSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleNavUpdateSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNavUpdateSettings({
      ...navUpdateSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          System Name
        </label>
        <input
          type="text"
          name="systemName"
          value={generalSettings.systemName}
          onChange={handleGeneralSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Support Email
        </label>
        <input
          type="email"
          name="supportEmail"
          value={generalSettings.supportEmail}
          onChange={handleGeneralSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Data Refresh Interval (seconds)
        </label>
        <input
          type="number"
          name="dataRefreshInterval"
          value={generalSettings.dataRefreshInterval}
          onChange={handleGeneralSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          name="maintenanceMode"
          checked={generalSettings.maintenanceMode}
          onChange={handleGeneralSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Maintenance Mode
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="debugMode"
          name="debugMode"
          checked={generalSettings.debugMode}
          onChange={handleGeneralSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Debug Mode
        </label>
      </div>
    </div>
  );
  
  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          name="sessionTimeout"
          value={securitySettings.sessionTimeout}
          onChange={handleSecuritySettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Login Attempts
        </label>
        <input
          type="number"
          name="maxLoginAttempts"
          value={securitySettings.maxLoginAttempts}
          onChange={handleSecuritySettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password Expiration (days)
        </label>
        <input
          type="number"
          name="passwordExpiration"
          value={securitySettings.passwordExpiration}
          onChange={handleSecuritySettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="requireTwoFactor"
          name="requireTwoFactor"
          checked={securitySettings.requireTwoFactor}
          onChange={handleSecuritySettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="requireTwoFactor" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Require Two-Factor Authentication
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="ipRestriction"
          name="ipRestriction"
          checked={securitySettings.ipRestriction}
          onChange={handleSecuritySettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="ipRestriction" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Enable IP Restriction
        </label>
      </div>
    </div>
  );
  
  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          SMTP Server
        </label>
        <input
          type="text"
          name="smtpServer"
          value={emailSettings.smtpServer}
          onChange={handleEmailSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          SMTP Port
        </label>
        <input
          type="text"
          name="smtpPort"
          value={emailSettings.smtpPort}
          onChange={handleEmailSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email From Address
        </label>
        <input
          type="email"
          name="emailFrom"
          value={emailSettings.emailFrom}
          onChange={handleEmailSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="useTLS"
          name="useTLS"
          checked={emailSettings.useTLS}
          onChange={handleEmailSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="useTLS" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Use TLS Encryption
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="emailTemplatesEnabled"
          name="emailTemplatesEnabled"
          checked={emailSettings.emailTemplatesEnabled}
          onChange={handleEmailSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="emailTemplatesEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Enable Email Templates
        </label>
      </div>
    </div>
  );
  
  const renderNavUpdateSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoUpdateEnabled"
          name="autoUpdateEnabled"
          checked={navUpdateSettings.autoUpdateEnabled}
          onChange={handleNavUpdateSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="autoUpdateEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Enable Automatic NAV Updates
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Update Frequency
        </label>
        <select
          name="updateFrequency"
          value={navUpdateSettings.updateFrequency}
          onChange={handleNavUpdateSettingChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="15min">Every 15 minutes</option>
          <option value="30min">Every 30 minutes</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="allowManualOverride"
          name="allowManualOverride"
          checked={navUpdateSettings.allowManualOverride}
          onChange={handleNavUpdateSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="allowManualOverride" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Allow Manual NAV Overrides
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="requireJustification"
          name="requireJustification"
          checked={navUpdateSettings.requireJustification}
          onChange={handleNavUpdateSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="requireJustification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Require Justification for Manual Updates
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="notifyOnChange"
          name="notifyOnChange"
          checked={navUpdateSettings.notifyOnChange}
          onChange={handleNavUpdateSettingChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="notifyOnChange" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Send Notifications on Significant Changes
        </label>
      </div>
    </div>
  );
  
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return renderEmailSettings();
      case 'navupdate':
        return renderNavUpdateSettings();
      default:
        return renderGeneralSettings();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          System Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure platform settings and behavior
        </p>
      </div>
      
      <div className="p-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveSection('general')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'general'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'security'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveSection('email')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'email'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveSection('navupdate')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'navupdate'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              NAV Updates
            </button>
          </nav>
        </div>
        
        <div className="mt-6">
          {renderActiveSection()}
          
          {successMessage && (
            <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg">
              {successMessage}
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 