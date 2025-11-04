// Debug utilities for production troubleshooting
import { validateEnvironment, validateCriticalEnvVars, debugEnvironment } from '@/lib/envValidation';

export const debugAuthState = () => {
  console.log('🔍 ===== AUTH STATE DEBUG =====');
  console.log('🌐 Current URL:', window.location.href);
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('🔒 Protocol:', window.location.protocol);
  console.log('📅 Timestamp:', new Date().toISOString());
  
  // Check cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  console.log('🍪 All cookies:', cookies);
  
  // Check specific auth cookies
  const authCookies = ['token', 'google_token', 'next-auth.session-token'];
  authCookies.forEach(cookieName => {
    const cookie = cookies.find(c => c.startsWith(cookieName + '='));
    console.log(`🍪 ${cookieName}:`, cookie ? 'EXISTS' : 'NOT FOUND');
  });
  
  // Check localStorage
  console.log('💾 localStorage keys:', Object.keys(localStorage));
  
  // Check sessionStorage
  console.log('💾 sessionStorage keys:', Object.keys(sessionStorage));
};

export const debugLogoutProcess = () => {
  console.log('🔍 ===== LOGOUT DEBUG PROCESS =====');
  
  // Test server connectivity
  fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })
  .then(response => {
    console.log('📡 /api/auth/me response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📡 /api/auth/me response data:', data);
  })
  .catch(error => {
    console.error('❌ /api/auth/me request failed:', error);
  });
  
  // Test logout endpoint
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log('📡 /api/auth/logout response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📡 /api/auth/logout response data:', data);
  })
  .catch(error => {
    console.error('❌ /api/auth/logout request failed:', error);
  });
};

export const forceClearAllCookies = () => {
  console.log('🧹 ===== FORCE CLEAR ALL COOKIES =====');
  
  // Clear all cookies by setting them to expire in the past
  const allCookies = document.cookie.split(';');
  let clearedCount = 0;
  
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName) {
      try {
        // Clear with multiple configurations
        const configs = [
          `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
          `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`,
          `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`,
        ];
        
        configs.forEach(config => {
          document.cookie = config;
          clearedCount++;
        });
        
        console.log(`🧹 Cleared cookie: ${cookieName}`);
      } catch (error) {
        console.error(`❌ Failed to clear cookie: ${cookieName}`, error);
      }
    }
  });
  
  console.log(`🧹 Total cookie clear attempts: ${clearedCount}`);
  console.log('🧹 Remaining cookies:', document.cookie);
  
  return clearedCount;
};

// New environment validation debug function
export const debugEnvironmentVariables = () => {
  console.log('🔍 ===== ENVIRONMENT VARIABLES DEBUG =====');
  
  // Test critical variables
  const criticalValid = validateCriticalEnvVars();
  console.log('✅ Critical variables validation:', criticalValid ? 'PASSED' : 'FAILED');
  
  // Show environment debug info
  debugEnvironment();
  
  // Test full validation
  try {
    const result = validateEnvironment();
    console.log('\n📊 Full validation results:');
    console.log(`  - Overall status: ${result.isValid ? 'PASSED' : 'FAILED'}`);
    console.log(`  - Valid variables: ${result.summary.valid}`);
    console.log(`  - Missing variables: ${result.summary.missing}`);
    console.log(`  - Invalid variables: ${result.summary.invalid}`);
    console.log(`  - Warnings: ${result.summary.warnings}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors found:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings found:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
  (window as any).debugLogoutProcess = debugLogoutProcess;
  (window as any).forceClearAllCookies = forceClearAllCookies;
  (window as any).debugEnvironmentVariables = debugEnvironmentVariables;
  
  console.log('🔧 Debug utilities loaded. Use:');
  console.log('  - debugAuthState() - Check current auth state');
  console.log('  - debugLogoutProcess() - Test logout endpoints');
  console.log('  - forceClearAllCookies() - Force clear all cookies');
  console.log('  - debugEnvironmentVariables() - Check environment variables');
} 