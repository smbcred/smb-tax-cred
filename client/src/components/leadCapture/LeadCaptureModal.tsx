/**
 * @file LeadCaptureModal.tsx
 * @description High-converting lead capture modal for R&D tax calculator
 * @author SMBTaxCredits.com Team
 * @date 2024-01-15
 * 
 * Captures user information at the moment of highest interest - right
 * after seeing their potential tax credit. Emphasizes value exchange
 * and builds trust for SMBs hesitant about sharing information.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Shield,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { formatCurrency } from '@/utils/calculations';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationResult: any;
  onSuccess: (leadId: string) => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  calculationResult,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { submitLead, isSubmitting, error: submitError } = useLeadCapture();

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => new Set(Array.from(prev).concat(field)));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string): boolean => {
    let error = '';

    switch (field) {
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email';
        }
        break;
      
      case 'firstName':
        if (!value) {
          error = 'First name is required';
        } else if (value.length < 2) {
          error = 'Please enter at least 2 characters';
        }
        break;
      
      case 'lastName':
        if (!value) {
          error = 'Last name is required';
        }
        break;
      
      case 'companyName':
        if (!value) {
          error = 'Company name is required';
        }
        break;
      
      case 'phone':
        // Phone is optional, but validate format if provided
        if (value && !/^[\d\s()+-]+$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    const fields = ['email', 'firstName', 'lastName', 'companyName'];
    let isValid = true;

    fields.forEach(field => {
      const fieldValid = validateField(field, formData[field as keyof typeof formData]);
      if (!fieldValid) isValid = false;
    });

    // Mark all fields as touched
    setTouchedFields(new Set(fields));
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      const firstErrorField = Object.keys(fieldErrors).find(key => fieldErrors[key]);
      if (firstErrorField) {
        const input = document.querySelector(`[name="${firstErrorField}"]`) as HTMLInputElement;
        input?.focus();
      }
      return;
    }

    try {
      const leadId = await submitLead({
        ...formData,
        calculationResult,
        source: 'calculator',
        creditAmount: calculationResult.federalCredit
      });

      // Success! Trigger success handler
      onSuccess(leadId);
    } catch (error) {
      // Error handled by hook
      console.error('Lead submission error:', error);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const { federalCredit, pricingTier } = calculationResult;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative bg-primary text-white p-6 rounded-t-2xl">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-3">
                    Great news! Your AI work may qualify for credits
                  </h2>
                  
                  {/* Prominent Credit Amount Display */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-3">
                    <p className="text-sm text-blue-100 mb-1">Potential Federal R&D Tax Credit</p>
                    <p className="text-4xl font-bold">
                      ${formatCurrency(federalCredit).replace('$', '')}
                    </p>
                  </div>
                  
                  <p className="text-sm text-blue-100">
                    Let's get your documentation package started
                  </p>
                </div>
              </div>

              {/* Trust Signal Bar */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure & confidential</span>
                </div>
              </div>

              {/* Success Story */}
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    <strong>Quick Example:</strong> Sarah's marketing agency spent 200 hours perfecting ChatGPT prompts for client proposals. That work alone qualified for $12,000 in potential credits.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label form-label-required">
                    Work Email
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="you@company.com"
                    className={`form-input ${touchedFields.has('email') && fieldErrors.email ? 'form-input-error' : ''}`}
                  />
                  {touchedFields.has('email') && fieldErrors.email && (
                    <p className="form-helper form-helper-error">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label form-label-required">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      onBlur={() => handleFieldBlur('firstName')}
                      placeholder="John"
                      className={`form-input ${touchedFields.has('firstName') && fieldErrors.firstName ? 'form-input-error' : ''}`}
                    />
                    {touchedFields.has('firstName') && fieldErrors.firstName && (
                      <p className="form-helper form-helper-error">{fieldErrors.firstName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label form-label-required">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      onBlur={() => handleFieldBlur('lastName')}
                      placeholder="Doe"
                      className={`form-input ${touchedFields.has('lastName') && fieldErrors.lastName ? 'form-input-error' : ''}`}
                    />
                    {touchedFields.has('lastName') && fieldErrors.lastName && (
                      <p className="form-helper form-helper-error">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Company Name */}
                <div className="form-group">
                  <label htmlFor="companyName" className="form-label form-label-required">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    onBlur={() => handleFieldBlur('companyName')}
                    placeholder="Acme Inc."
                    className={`form-input ${touchedFields.has('companyName') && fieldErrors.companyName ? 'form-input-error' : ''}`}
                  />
                  {touchedFields.has('companyName') && fieldErrors.companyName && (
                    <p className="form-helper form-helper-error">{fieldErrors.companyName}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="text-gray-500">(Optional - for faster service)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    onBlur={() => handleFieldBlur('phone')}
                    placeholder="(555) 123-4567"
                    className={`form-input ${touchedFields.has('phone') && fieldErrors.phone ? 'form-input-error' : ''}`}
                  />
                  {touchedFields.has('phone') && fieldErrors.phone && (
                    <p className="form-helper form-helper-error">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get My Full Credit Analysis
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <p className="text-xs text-gray-500 text-center">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Your information is secure and will never be shared. 
                  Join 500+ businesses who've saved on R&D credits.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};