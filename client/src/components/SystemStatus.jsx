
import { useState, useEffect } from 'react';

export default function SystemStatus() {
  const [status, setStatus] = useState({
    apiKey: { configured: false, message: '' },
    environment: { isValid: false, errors: [] }
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check server status and API configuration
        const response = await fetch('/api/system/status');
        const data = await response.json();
        
        if (data.success) {
          setStatus({
            apiKey: { 
              configured: data.data.apiKey.configured || false, 
              message: data.data.apiKey.message || 'Not configured' 
            },
            environment: { 
              isValid: data.data.environment.isValid || false, 
              errors: data.data.environment.errors || [] 
            }
          });
        } else {
          throw new Error(data.error || 'Failed to get status');
        }
      } catch (error) {
        console.error('Failed to check system status:', error);
        setStatus({
          apiKey: { configured: false, message: 'Unable to check status' },
          environment: { isValid: false, errors: ['Server not responding'] }
        });
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
      
      <div className="space-y-3">
        {/* API Key Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${status.apiKey.configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">Gemini API Key</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            status.apiKey.configured 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.apiKey.configured ? 'Configured' : 'Missing'}
          </span>
        </div>

        {/* Environment Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${status.environment.isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">Environment</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            status.environment.isValid 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.environment.isValid ? 'Running' : 'Error'}
          </span>
        </div>

        {/* Error Messages */}
        {status.environment.errors.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-2">Configuration Issues:</p>
            <ul className="text-xs text-red-700 space-y-1">
              {status.environment.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
