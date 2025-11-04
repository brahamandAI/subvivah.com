'use client';

import { useState } from 'react';

interface TestResult {
  status: 'success' | 'error' | 'not-tested';
  message: string;
  details?: string;
}

export default function APITest() {
  const [openaiResult, setOpenaiResult] = useState<TestResult>({ status: 'not-tested', message: 'Not tested' });
  const [didResult, setDidResult] = useState<TestResult>({ status: 'not-tested', message: 'Not tested' });
  const [isTesting, setIsTesting] = useState(false);

  const testOpenAI = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          language: 'English'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOpenaiResult({
          status: 'success',
          message: '✅ Connected successfully',
          details: `Response: ${data.response}`
        });
      } else {
        setOpenaiResult({
          status: 'error',
          message: '❌ Connection failed',
          details: `Status: ${response.status}, Error: ${data.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setOpenaiResult({
        status: 'error',
        message: '❌ Error occurred',
        details: (error as Error).message
      });
    }
  };

  const testDID = async () => {
    try {
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: 'Hello, this is a test message.',
          },
          source_url: 'https://storage.googleapis.com/d-id-prod-avatar-images/avatar.png',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDidResult({
          status: 'success',
          message: '✅ Connected successfully',
          details: `Video URL: ${data.video_url}`
        });
      } else {
        setDidResult({
          status: 'error',
          message: '❌ Connection failed',
          details: `Status: ${response.status}, Error: ${data.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setDidResult({
        status: 'error',
        message: '❌ Error occurred',
        details: (error as Error).message
      });
    }
  };

  const testAPIs = async () => {
    setIsTesting(true);
    setOpenaiResult({ status: 'not-tested', message: 'Testing...' });
    setDidResult({ status: 'not-tested', message: 'Testing...' });

    await Promise.all([testOpenAI(), testDID()]);
    setIsTesting(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">OpenAI API Status:</h3>
          <p className={getStatusColor(openaiResult.status)}>
            {openaiResult.message}
          </p>
          {openaiResult.details && (
            <p className="text-sm mt-2 text-gray-600">
              {openaiResult.details}
            </p>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">D-ID API Status:</h3>
          <p className={getStatusColor(didResult.status)}>
            {didResult.message}
          </p>
          {didResult.details && (
            <p className="text-sm mt-2 text-gray-600">
              {didResult.details}
            </p>
          )}
        </div>

        <button
          onClick={testAPIs}
          disabled={isTesting}
          className={`w-full py-2 px-4 rounded ${
            isTesting ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
          } text-white transition-colors duration-200`}
        >
          {isTesting ? 'Testing...' : 'Test APIs'}
        </button>
      </div>
    </div>
  );
} 