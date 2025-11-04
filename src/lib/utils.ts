import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

// Height conversion utilities
export function convertHeightToStandardFormat(height: string): number {
  if (!height) return 0;
  
  // If height is already in cm (e.g., "170")
  if (!isNaN(parseInt(height))) {
    return parseInt(height);
  }
  
  // If height is in feet and inches format (e.g., "5'7" or "5'7\"" or "5ft 7in")
  const feetInchesRegex = /(\d+)['ft\s]+(\d*)/i;
  const matches = height.match(feetInchesRegex);
  
  if (matches) {
    const feet = parseInt(matches[1]);
    const inches = matches[2] ? parseInt(matches[2]) : 0;
    return Math.round((feet * 30.48) + (inches * 2.54)); // Convert to cm
  }
  
  return 0; // Return 0 for invalid formats
}

export function convertCmToFeetInches(cm: number): string {
  if (!cm) return '';
  
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function heightToDisplayFormat(height: string | null): string {
  if (!height) return '';
  
  // If height is already in cm format
  if (!isNaN(parseInt(height))) {
    const cm = parseInt(height);
    return `${convertCmToFeetInches(cm)} (${cm} cm)`;
  }
  
  // If height is in feet and inches format
  const cm = convertHeightToStandardFormat(height);
  if (cm > 0) {
    return `${height} (${cm} cm)`;
  }
  
  return height; // Return original if conversion fails
}

export function formatMaritalStatus(status: string | null): string {
  if (!status) return '';
  
  const statusMap: { [key: string]: string } = {
    'never_married': 'Never Married',
    'divorced': 'Divorced',
    'widowed': 'Widowed',
    'awaiting_divorce': 'Awaiting Divorce',
    'separated': 'Separated'
  };
  
  return statusMap[status.toLowerCase()] || status;
}

export function formatMotherTongue(motherTongue: string | null): string {
  if (!motherTongue) return '';
  
  // Capitalize first letter and make rest lowercase
  return motherTongue.charAt(0).toUpperCase() + motherTongue.slice(1).toLowerCase();
} 