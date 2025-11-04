export const validatePassword = (password: string): string => {
  const requirements = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const missingRequirements = [];
  if (!requirements.length) {
    missingRequirements.push('At least 8 characters');
  }
  if (!requirements.letter) {
    missingRequirements.push('At least one letter');
  }
  if (!requirements.number) {
    missingRequirements.push('At least one number');
  }
  if (!requirements.special) {
    missingRequirements.push('At least one special character');
  }
  
  return missingRequirements.length > 0 ? missingRequirements.join(', ') : '';
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePhone = (phone: string): string => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid 10-digit phone number';
  }
  return '';
};

export const validateName = (name: string): string => {
  if (name.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return 'Name can only contain letters and spaces';
  }
  return '';
};

export const validateDateOfBirth = (dateOfBirth: string): string => {
  if (!dateOfBirth) {
    return 'Please select your date of birth';
  }
  
  const selectedDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - selectedDate.getFullYear();
  
  if (age < 18) {
    return 'You must be at least 18 years old to register';
  }
  
  if (age > 100) {
    return 'Please enter a valid date of birth';
  }
  
  return '';
}; 