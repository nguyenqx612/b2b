import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { POLineItems } from './POLineItems';
import type { POItem } from '@b2b/shared';

const items: POItem[] = [
  {
    id: '1',
    productId: 'p1',
    product: { name: 'Jasmine Rice', sku: 'RICE-001' },
    quantity: 100,
    unitPriceCents: 2800,
    cbmSubtotal: 3.5,
  },
];

describe('POLineItems', () => {
  it('renders nested product name and sku', () => {
    render(<POLineItems items={items} />);
    expect(screen.getByText('Jasmine Rice')).toBeTruthy();
    expect(screen.getByText('RICE-001')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });
});
