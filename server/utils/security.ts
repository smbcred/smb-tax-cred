export const passwordSecurity = {
  /**
   * Check password strength
   */
  checkStrength: (password: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const score = [
      password.length >= minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    ].filter(Boolean).length;
    
    return {
      score,
      isValid: score >= 3,
      feedback: {
        minLength: password.length >= minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  }
};

export const logSecurityEvent = (event: string, details: any, userId?: string) => {
  console.log(`Security event: ${event}`, {
    event,
    details,
    userId,
    timestamp: new Date().toISOString(),
    category: 'security'
  });
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};