import { excerpt } from './text';

describe('excerpt', () => {
  it('keeps short texts', () => {
    expect(excerpt('short', 10)).toBe('short');
  });

  it('truncates long texts and adds an ellipsis', () => {
    expect(excerpt('abcdefghij', 5)).toBe('abcd…');
  });
});
