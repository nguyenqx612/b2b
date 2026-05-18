import { describe, it, expect } from 'vitest';
import { simulateContainer } from './cbm.utils.js';
import { CBM_40FT } from '../constants/container.constants.js';

describe('CBM constants', () => {
  it('40ft capacity constant is 67.3', () => {
    expect(CBM_40FT).toBe(67.3);
  });
});

describe('simulateContainer', () => {
  it('zero items → totalCBM = 0', () => {
    const result = simulateContainer([]);
    expect(result.totalCBM).toBe(0);
    expect(result.containersNeeded).toBe(0);
    expect(result.utilizationPct).toBe(0);
  });

  it('single item, quantity 1, cbm < 67.3 → 1 full container slot, utilization < 100%', () => {
    const result = simulateContainer([
      { productId: 'p1', name: 'Widget', quantity: 1, cbmPerUnit: 10 },
    ]);
    expect(result.totalCBM).toBe(10);
    expect(result.fullContainers).toBe(0);
    expect(result.containersNeeded).toBeLessThan(1);
    expect(result.utilizationPct).toBeLessThan(100);
    // remainderCBM should equal totalCBM since no full container
    expect(result.remainderCBM).toBeCloseTo(10, 3);
  });

  it('exactly 67.3 CBM → 1 full container, 100% utilization', () => {
    const result = simulateContainer([
      { productId: 'p1', name: 'Widget', quantity: 1, cbmPerUnit: 67.3 },
    ]);
    expect(result.totalCBM).toBe(67.3);
    expect(result.fullContainers).toBe(1);
    expect(result.utilizationPct).toBe(100);
    expect(result.remainderCBM).toBe(0);
  });

  it('exactly 134.6 CBM → 2 full containers, 100% utilization', () => {
    const result = simulateContainer([
      { productId: 'p1', name: 'Widget', quantity: 2, cbmPerUnit: 67.3 },
    ]);
    expect(result.totalCBM).toBe(134.6);
    expect(result.fullContainers).toBe(2);
    expect(result.utilizationPct).toBe(100);
    expect(result.remainderCBM).toBe(0);
  });

  it('70 CBM → containersNeeded > 1, second container ~4% utilized', () => {
    const result = simulateContainer([
      { productId: 'p1', name: 'Heavy Box', quantity: 1, cbmPerUnit: 70 },
    ]);
    expect(result.totalCBM).toBe(70);
    expect(result.fullContainers).toBe(1);
    expect(result.containersNeeded).toBeGreaterThan(1);
    // remainder = 70 - 67.3 = 2.7, utilization = 2.7/67.3 * 100 ≈ 4.01%
    expect(result.remainderCBM).toBeCloseTo(2.7, 2);
    expect(result.utilizationPct).toBeCloseTo(4.01, 1);
  });

  it('multiple items sum correctly', () => {
    const result = simulateContainer([
      { productId: 'p1', name: 'A', quantity: 2, cbmPerUnit: 10 },
      { productId: 'p2', name: 'B', quantity: 3, cbmPerUnit: 5 },
      { productId: 'p3', name: 'C', quantity: 1, cbmPerUnit: 12.5 },
    ]);
    // subtotals: 20 + 15 + 12.5 = 47.5
    expect(result.totalCBM).toBe(47.5);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]!.subtotalCBM).toBe(20);
    expect(result.items[1]!.subtotalCBM).toBe(15);
    expect(result.items[2]!.subtotalCBM).toBe(12.5);
  });

  it('containerType defaults to 40ft', () => {
    const result = simulateContainer([
      { productId: 'p1', name: 'A', quantity: 1, cbmPerUnit: 10 },
    ]);
    expect(result.containerType).toBe('40ft');
    expect(result.containerCBM).toBe(67.3);
  });

  it('items array on result has productId and name fields', () => {
    const result = simulateContainer([
      { productId: 'abc-123', name: 'My Product', quantity: 5, cbmPerUnit: 2 },
    ]);
    expect(result.items[0]!.productId).toBe('abc-123');
    expect(result.items[0]!.name).toBe('My Product');
    expect(result.items[0]!.quantity).toBe(5);
    expect(result.items[0]!.cbmPerUnit).toBe(2);
    expect(result.items[0]!.subtotalCBM).toBe(10);
  });
});
