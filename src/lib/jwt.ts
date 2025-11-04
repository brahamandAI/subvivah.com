import { sign, verify } from 'jsonwebtoken';
import { validateCriticalEnvVars, getEnvVar } from './envValidation';

// Centralized JWT secret management with validation
export const getJwtSecret = (): string => {
  // Validate critical environment variables first
  if (!validateCriticalEnvVars()) {
    console.error('❌ Critical environment variables validation failed!');
    throw new Error('Critical environment variables are not properly configured');
  }
  
  const secret = getEnvVar('JWT_SECRET') || getEnvVar('NEXTAUTH_SECRET');
  if (!secret) {
    console.error('❌ JWT_SECRET or NEXTAUTH_SECRET environment variable is not set!');
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be set');
  }
  
  // Validate secret length
  if (secret.length < 32) {
    console.error('❌ JWT secret is too short! Minimum 32 characters required.');
    throw new Error('JWT secret must be at least 32 characters long');
  }
  
  return secret;
};

// Standardized JWT sign function
export const signJwt = (payload: any, options?: any) => {
  try {
    return sign(payload, getJwtSecret(), {
      expiresIn: '7d',
      algorithm: 'HS256',
      ...options
    });
  } catch (error) {
    console.error('❌ JWT signing failed:', error);
    throw error;
  }
};

// Standardized JWT verify function
export const verifyJwt = (token: string, options?: any) => {
  try {
    return verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      ...options
    });
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    throw error;
  }
};

// Debug function to check JWT configuration
export const debugJwtConfig = () => {
  console.log('🔍 JWT Configuration Debug:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('  - NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
  
  try {
    const secret = getJwtSecret();
    console.log('  - Final secret length:', secret.length);
    console.log('  - Secret preview:', secret.substring(0, 10) + '...');
  } catch (error) {
    console.error('  - ❌ JWT secret validation failed:', error);
  }
}; 