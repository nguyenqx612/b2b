import { describe, it, expect } from 'vitest';
import { containerSimulateSchema } from './container.schema.js';

describe('containerSimulateSchema', () => {
  it('accepts valid container types', () => {
    expect(containerSimulateSchema.safeParse({ containerType: '40ft' }).success).toBe(true);
    expect(containerSimulateSchema.safeParse({ containerType: '20ft' }).success).toBe(true);
    expect(containerSimulateSchema.safeParse({ containerType: '40ft_hc' }).success).toBe(true);
  });

  it('defaults to 40ft', () => {
    const result = containerSimulateSchema.parse({});
    expect(result.containerType).toBe('40ft');
  });

  it('rejects invalid container type', () => {
    expect(containerSimulateSchema.safeParse({ containerType: 'invalid' }).success).toBe(false);
  });
});
