import { describe, expect, it } from 'vitest';

describe('CI failure check', () => {
  it('fails on purpose to prove CI blocks broken changes', () => {
    expect(1 + 1).toBe(3);
  });
});
