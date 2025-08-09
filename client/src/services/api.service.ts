/**
 * @file api.service.ts
 * @description API service for R&D Tax Credit application
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies API Client, Auth Service
 * @knowledgeBase Handles all API communication with proper error handling and token management
 */

import { apiRequest } from "@/lib/queryClient";
import type { 
  CalculatorExpenses, 
  CalculationResult, 
  LeadCaptureData, 
  CompanyInfoData 
} from "@shared/schema";

// Auth service
export const authService = {
  async login(email: string, password: string) {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    
    return data;
  },

  async register(email: string, password: string) {
    const response = await apiRequest("POST", "/api/auth/register", { email, password });
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem("auth_token");
    // Redirect handled by calling component
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Simple token expiry check (if JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Calculator service
export const calculatorService = {
  async calculate(expenses: CalculatorExpenses): Promise<CalculationResult> {
    const response = await apiRequest("POST", "/api/calculator/calculate", expenses);
    return response.json();
  },

  async saveCalculation(calculationData: any) {
    const response = await apiRequest("POST", "/api/calculations", calculationData);
    return response.json();
  },

  async getCalculations() {
    const response = await apiRequest("GET", "/api/calculations");
    return response.json();
  }
};

// Lead service
export const leadService = {
  async captureLead(leadData: LeadCaptureData & { calculationData?: any }) {
    const response = await apiRequest("POST", "/api/leads", leadData);
    return response.json();
  }
};

// Company service  
export const companyService = {
  async createCompany(companyData: CompanyInfoData) {
    const response = await apiRequest("POST", "/api/companies", companyData);
    return response.json();
  },

  async getCompanies() {
    const response = await apiRequest("GET", "/api/companies");
    return response.json();
  },

  async updateCompany(id: string, updates: Partial<CompanyInfoData>) {
    const response = await apiRequest("PUT", `/api/companies/${id}`, updates);
    return response.json();
  }
};

// Intake form service
export const intakeFormService = {
  async createIntakeForm(formData: any) {
    const response = await apiRequest("POST", "/api/intake-forms", formData);
    return response.json();
  },

  async getIntakeForms() {
    const response = await apiRequest("GET", "/api/intake-forms");
    return response.json();
  },

  async updateIntakeForm(id: string, updates: any) {
    const response = await apiRequest("PUT", `/api/intake-forms/${id}`, updates);
    return response.json();
  },

  async autoSave(id: string, formData: any) {
    // Debounced auto-save implementation
    return this.updateIntakeForm(id, { 
      formData,
      updatedAt: new Date().toISOString()
    });
  }
};

// Payment service
export const paymentService = {
  async createPaymentIntent(amount: number, calculationId?: string) {
    const response = await apiRequest("POST", "/api/create-payment-intent", {
      amount,
      calculationId
    });
    return response.json();
  }
};

// Dashboard service
export const dashboardService = {
  async getDashboardData() {
    const response = await apiRequest("GET", "/api/dashboard");
    return response.json();
  }
};

// Generic error handler for API calls
export const handleApiError = (error: Error): string => {
  if (error.message.includes("401")) {
    // Token expired or invalid
    authService.logout();
    window.location.href = "/";
    return "Please log in again";
  }
  
  if (error.message.includes("400")) {
    // Validation error
    return "Please check your input and try again";
  }
  
  if (error.message.includes("500")) {
    // Server error
    return "Server error. Please try again later";
  }
  
  // Network or other error
  return error.message || "Something went wrong. Please try again";
};

// Utility function to add auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = authService.getToken();
  return token 
    ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    : { 'Content-Type': 'application/json' };
};

// Enhanced API request with automatic auth header injection
export const authenticatedApiRequest = async (
  method: string,
  url: string,
  data?: any
): Promise<Response> => {
  const token = authService.getToken();
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  return response;
};
