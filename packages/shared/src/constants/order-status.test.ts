import { describe, it, expect } from 'vitest';
import { isValidTransition, ORDER_STATUS } from './order-status.js';

describe('isValidTransition', () => {
  // Valid transitions
  it('draft → submitted is valid', () => {
    expect(isValidTransition(ORDER_STATUS.DRAFT, ORDER_STATUS.SUBMITTED)).toBe(true);
  });

  it('submitted → acknowledged is valid', () => {
    expect(isValidTransition(ORDER_STATUS.SUBMITTED, ORDER_STATUS.ACKNOWLEDGED)).toBe(true);
  });

  it('submitted → cancelled is valid', () => {
    expect(isValidTransition(ORDER_STATUS.SUBMITTED, ORDER_STATUS.CANCELLED)).toBe(true);
  });

  it('acknowledged → confirmed is valid', () => {
    expect(isValidTransition(ORDER_STATUS.ACKNOWLEDGED, ORDER_STATUS.CONFIRMED)).toBe(true);
  });

  it('confirmed → in_production is valid', () => {
    expect(isValidTransition(ORDER_STATUS.CONFIRMED, ORDER_STATUS.IN_PRODUCTION)).toBe(true);
  });

  it('shipped → delivered is valid', () => {
    expect(isValidTransition(ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED)).toBe(true);
  });

  // Invalid transitions
  it('delivered → cancelled is invalid (terminal state)', () => {
    expect(isValidTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED)).toBe(false);
  });

  it('draft → shipped is invalid (skipping states)', () => {
    expect(isValidTransition(ORDER_STATUS.DRAFT, ORDER_STATUS.SHIPPED)).toBe(false);
  });

  it('submitted → draft is invalid (backwards)', () => {
    expect(isValidTransition(ORDER_STATUS.SUBMITTED, ORDER_STATUS.DRAFT)).toBe(false);
  });

  it('acknowledged → draft is invalid (any transition TO draft is invalid)', () => {
    expect(isValidTransition(ORDER_STATUS.ACKNOWLEDGED, ORDER_STATUS.DRAFT)).toBe(false);
  });

  it('confirmed → draft is invalid (any transition TO draft is invalid)', () => {
    expect(isValidTransition(ORDER_STATUS.CONFIRMED, ORDER_STATUS.DRAFT)).toBe(false);
  });

  it('cancelled → draft is invalid (terminal state, no transitions out)', () => {
    expect(isValidTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.DRAFT)).toBe(false);
  });

  it('cancelled → submitted is invalid (terminal state)', () => {
    expect(isValidTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.SUBMITTED)).toBe(false);
  });

  it('delivered → submitted is invalid (terminal state)', () => {
    expect(isValidTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.SUBMITTED)).toBe(false);
  });

  it('draft → cancelled is valid (can cancel a draft)', () => {
    expect(isValidTransition(ORDER_STATUS.DRAFT, ORDER_STATUS.CANCELLED)).toBe(true);
  });

  it('in_production → cancelled is valid', () => {
    expect(isValidTransition(ORDER_STATUS.IN_PRODUCTION, ORDER_STATUS.CANCELLED)).toBe(true);
  });

  it('ready_to_ship → cancelled is invalid (no cancel from ready_to_ship)', () => {
    // According to STATUS_TRANSITIONS, ready_to_ship only allows 'shipped'
    expect(isValidTransition(ORDER_STATUS.READY_TO_SHIP, ORDER_STATUS.CANCELLED)).toBe(false);
  });
});
