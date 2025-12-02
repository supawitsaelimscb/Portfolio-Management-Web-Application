/**
 * Security validation utilities for input sanitization and validation
 */

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Strong password requirements
const PASSWORD_MIN_LENGTH = 8;

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 1000); // Limit length to prevent abuse
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email.toLowerCase());
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&#)
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&#)');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate display name
 */
export function validateDisplayName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Name must not exceed 100 characters' };
  }

  // Allow only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate amount (positive number)
 */
export function validateAmount(amount: number): {
  isValid: boolean;
  error?: string;
} {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (amount > 1000000000) {
    return { isValid: false, error: 'Amount exceeds maximum limit' };
  }

  return { isValid: true };
}

/**
 * Validate portfolio/transaction notes
 */
export function validateNotes(notes: string): {
  isValid: boolean;
  error?: string;
} {
  if (notes && notes.length > 500) {
    return { isValid: false, error: 'Notes must not exceed 500 characters' };
  }

  return { isValid: true };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if action is allowed for this identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetAt) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetAt) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }

  /**
   * Reset attempts for identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up expired records (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetAt) {
        this.attempts.delete(key);
      }
    }
  }
}

// Export singleton instances for different use cases
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const otpRateLimiter = new RateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 minutes
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour

// Cleanup expired records every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    loginRateLimiter.cleanup();
    otpRateLimiter.cleanup();
    passwordResetRateLimiter.cleanup();
  }, 10 * 60 * 1000);
}
