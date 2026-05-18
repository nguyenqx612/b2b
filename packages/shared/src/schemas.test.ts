import { describe, it, expect } from 'vitest';
import { loginSchema } from './schemas/auth.schema.js';
import { createPOSchema } from './schemas/order.schema.js';

describe('loginSchema', () => {
  it('valid email + password passes', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('missing email fails', () => {
    const result = loginSchema.safeParse({ password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('missing password fails', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
  });

  it('invalid email format fails', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('empty password fails (min 1)', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('both fields missing fails', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('createPOSchema', () => {
  const validInput = {
    sellerId: '550e8400-e29b-41d4-a716-446655440000',
    items: [
      { productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 5 },
    ],
  };

  it('valid input passes', () => {
    const result = createPOSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('valid input with optional fields passes', () => {
    const result = createPOSchema.safeParse({
      ...validInput,
      notes: 'Please ship ASAP',
      shippingTerms: 'FOB',
      portOfLoading: 'Ho Chi Minh City',
      portOfDischarge: 'Los Angeles',
    });
    expect(result.success).toBe(true);
  });

  it('empty items array fails', () => {
    const result = createPOSchema.safeParse({ ...validInput, items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('item'))).toBe(true);
    }
  });

  it('negative quantity fails', () => {
    const result = createPOSchema.safeParse({
      ...validInput,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('zero quantity fails (must be positive)', () => {
    const result = createPOSchema.safeParse({
      ...validInput,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('non-integer quantity fails', () => {
    const result = createPOSchema.safeParse({
      ...validInput,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it('invalid sellerId UUID fails', () => {
    const result = createPOSchema.safeParse({ ...validInput, sellerId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('missing sellerId fails', () => {
    const result = createPOSchema.safeParse({ items: validInput.items });
    expect(result.success).toBe(false);
  });

  it('multiple items all pass', () => {
    const result = createPOSchema.safeParse({
      ...validInput,
      items: [
        { productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 10 },
        { productId: '550e8400-e29b-41d4-a716-446655440002', quantity: 20 },
      ],
    });
    expect(result.success).toBe(true);
  });
});
