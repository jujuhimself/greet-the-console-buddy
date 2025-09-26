
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number').optional();

// User registration validation
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['individual', 'retail', 'wholesale', 'lab']),
  phone: phoneSchema,
  address: z.string().optional(),
  // Individual specific
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  // Retail specific
  pharmacyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  pharmacistName: z.string().optional(),
  // Wholesale specific
  businessName: z.string().optional(),
  businessLicense: z.string().optional(),
  taxId: z.string().optional(),
  // Lab specific
  labName: z.string().optional(),
  labLicense: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  operatingHours: z.string().optional(),
});

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  buyPrice: z.number().min(0, 'Buy price must be positive'),
  sellPrice: z.number().min(0, 'Sell price must be positive'),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  minStock: z.number().int().min(0, 'Minimum stock must be a non-negative integer'),
  maxStock: z.number().int().min(0, 'Maximum stock must be a non-negative integer').optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  supplier: z.string().optional(),
});

// Order validation
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
  })).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }).optional(),
});

// Validation helper functions
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown): { isValid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { isValid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};
