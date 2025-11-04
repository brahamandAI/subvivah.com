// Environment variable validation utility
interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  validation?: (value: string) => boolean;
}

// Define all environment variables
const ENV_VARS: EnvVar[] = [
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'JWT signing secret for authentication tokens',
    validation: (value) => value.length >= 32
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'NextAuth.js secret for session management',
    validation: (value) => value.length >= 32
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'Database connection string',
    validation: (value) => value.includes('mongodb') || value.includes('postgresql')
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Public application URL',
    validation: (value) => value.startsWith('http')
  },
  {
    name: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    required: true,
    description: 'Google OAuth client ID',
    validation: (value) => value.includes('.apps.googleusercontent.com')
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    required: true,
    description: 'Google OAuth client ID (server-side)',
    validation: (value) => value.includes('.apps.googleusercontent.com')
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Node.js environment',
    defaultValue: 'development',
    validation: (value) => ['development', 'production', 'test'].includes(value)
  },
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    required: false,
    description: 'Cloudinary cloud name for image uploads',
    defaultValue: ''
  },
  {
    name: 'CLOUDINARY_API_KEY',
    required: false,
    description: 'Cloudinary API key',
    defaultValue: ''
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    required: false,
    description: 'Cloudinary API secret',
    defaultValue: ''
  },
  {
    name: 'NEXT_PUBLIC_OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for AI features',
    defaultValue: ''
  },
  {
    name: 'EMAIL_USER',
    required: false,
    description: 'Email service username',
    defaultValue: ''
  },
  {
    name: 'EMAIL_PASSWORD',
    required: false,
    description: 'Email service password',
    defaultValue: ''
  }
];

// Validation results interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  invalid: string[];
  summary: {
    total: number;
    valid: number;
    missing: number;
    invalid: number;
    warnings: number;
  };
}

// Main validation function
export const validateEnvironment = (): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missing: [],
    invalid: [],
    summary: {
      total: ENV_VARS.length,
      valid: 0,
      missing: 0,
      invalid: 0,
      warnings: 0
    }
  };

  console.log('🔍 ===== ENVIRONMENT VARIABLE VALIDATION =====');
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('📅 Timestamp:', new Date().toISOString());

  ENV_VARS.forEach(envVar => {
    const value = process.env[envVar.name];
    
    console.log(`\n🔍 Checking: ${envVar.name}`);
    console.log(`   Description: ${envVar.description}`);
    console.log(`   Required: ${envVar.required}`);
    
    if (!value) {
      if (envVar.required) {
        result.errors.push(`❌ Missing required environment variable: ${envVar.name}`);
        result.missing.push(envVar.name);
        result.summary.missing++;
        result.isValid = false;
        console.log(`   ❌ Status: MISSING (required)`);
      } else {
        result.warnings.push(`⚠️ Missing optional environment variable: ${envVar.name}`);
        result.summary.warnings++;
        console.log(`   ⚠️ Status: MISSING (optional)`);
      }
      return;
    }

    // Check if value is empty string
    if (value.trim() === '') {
      if (envVar.required) {
        result.errors.push(`❌ Empty required environment variable: ${envVar.name}`);
        result.invalid.push(envVar.name);
        result.summary.invalid++;
        result.isValid = false;
        console.log(`   ❌ Status: EMPTY (required)`);
      } else {
        result.warnings.push(`⚠️ Empty optional environment variable: ${envVar.name}`);
        result.summary.warnings++;
        console.log(`   ⚠️ Status: EMPTY (optional)`);
      }
      return;
    }

    // Run custom validation if provided
    if (envVar.validation) {
      try {
        const isValid = envVar.validation(value);
        if (!isValid) {
          result.errors.push(`❌ Invalid value for environment variable: ${envVar.name}`);
          result.invalid.push(envVar.name);
          result.summary.invalid++;
          result.isValid = false;
          console.log(`   ❌ Status: INVALID (failed validation)`);
          return;
        }
      } catch (error) {
        result.errors.push(`❌ Validation error for environment variable: ${envVar.name} - ${error}`);
        result.invalid.push(envVar.name);
        result.summary.invalid++;
        result.isValid = false;
        console.log(`   ❌ Status: VALIDATION ERROR`);
        return;
      }
    }

    // Value is valid
    result.summary.valid++;
    console.log(`   ✅ Status: VALID`);
    console.log(`   📝 Value: ${envVar.name.includes('SECRET') || envVar.name.includes('PASSWORD') || envVar.name.includes('KEY') ? '***' : value.substring(0, 50) + (value.length > 50 ? '...' : '')}`);
  });

  // Print summary
  console.log('\n📊 ===== VALIDATION SUMMARY =====');
  console.log(`✅ Valid: ${result.summary.valid}`);
  console.log(`❌ Missing: ${result.summary.missing}`);
  console.log(`❌ Invalid: ${result.summary.invalid}`);
  console.log(`⚠️ Warnings: ${result.summary.warnings}`);
  console.log(`📊 Total: ${result.summary.total}`);
  console.log(`🎯 Overall Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);

  if (result.errors.length > 0) {
    console.log('\n❌ ===== ERRORS =====');
    result.errors.forEach(error => console.log(error));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ ===== WARNINGS =====');
    result.warnings.forEach(warning => console.log(warning));
  }

  return result;
};

// Quick validation for critical variables
export const validateCriticalEnvVars = (): boolean => {
  const criticalVars = ['JWT_SECRET', 'NEXTAUTH_SECRET', 'DATABASE_URL', 'NEXT_PUBLIC_APP_URL'];
  
  for (const varName of criticalVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      console.error(`❌ Critical environment variable missing: ${varName}`);
      return false;
    }
  }
  
  return true;
};

// Get environment variable with validation
export const getEnvVar = (name: string, required: boolean = true): string => {
  const value = process.env[name];
  
  if (!value && required) {
    throw new Error(`Required environment variable not set: ${name}`);
  }
  
  return value || '';
};

// Debug function to show all environment variables (without sensitive data)
export const debugEnvironment = () => {
  console.log('🔍 ===== ENVIRONMENT DEBUG =====');
  console.log('🌐 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'SET (' + process.env.JWT_SECRET.length + ' chars)' : 'NOT SET');
  console.log('🔑 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET (' + process.env.NEXTAUTH_SECRET.length + ' chars)' : 'NOT SET');
  console.log('🌐 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('🔑 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('☁️ CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('🤖 OPENAI_API_KEY:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'SET' : 'NOT SET');
};

// Export for use in other files
export default {
  validateEnvironment,
  validateCriticalEnvVars,
  getEnvVar,
  debugEnvironment
}; 