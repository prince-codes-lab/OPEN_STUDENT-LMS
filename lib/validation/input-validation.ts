const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" }
  }

  if (email.length > 255) {
    return { valid: false, error: "Email is too long" }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Invalid email format" }
  }

  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" }
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" }
  }

  if (password.length > 128) {
    return { valid: false, error: "Password is too long" }
  }

  // Check for uppercase, number, and special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      error: "Password must contain uppercase letter, number, and special character (@$!%*?&)",
    }
  }

  return { valid: true }
}

export function validateString(value: string, fieldName: string, minLength = 1, maxLength = 255): ValidationResult {
  if (!value || typeof value !== "string") {
    return { valid: false, error: `${fieldName} is required` }
  }

  if (value.trim().length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }

  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` }
  }

  return { valid: true }
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): ValidationResult {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` }
  }

  if (typeof value !== "number") {
    return { valid: false, error: `${fieldName} must be a number` }
  }

  if (min !== undefined && value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` }
  }

  if (max !== undefined && value > max) {
    return { valid: false, error: `${fieldName} cannot exceed ${max}` }
  }

  return { valid: true }
}

export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" }
  }

  // Simple validation: only digits, +, -, and spaces
  const phoneRegex = /^[+\d\s\-()]+$/
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: "Invalid phone number format" }
  }

  if (phone.replace(/\D/g, "").length < 10) {
    return { valid: false, error: "Phone number must have at least 10 digits" }
  }

  return { valid: true }
}

export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>"']/g, "")
}

export function validateEnrollmentData(data: any): ValidationResult {
  if (!data.courseId && !data.tourId) {
    return { valid: false, error: "Either courseId or tourId is required" }
  }

  if (data.courseId && typeof data.courseId !== "string") {
    return { valid: false, error: "Invalid courseId" }
  }

  if (data.tourId && typeof data.tourId !== "string") {
    return { valid: false, error: "Invalid tourId" }
  }

  return { valid: true }
}

export function validateProgressUpdate(progress: any): ValidationResult {
  const numberValidation = validateNumber(progress, "Progress", 0, 100)
  if (!numberValidation.valid) {
    return numberValidation
  }

  return { valid: true }
}
