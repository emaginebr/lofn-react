import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined and null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('merges complex tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});
