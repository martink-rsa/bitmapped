import { describe, it, expect, vi, afterEach } from 'vitest';
import { defaultFilenameBase } from './helpers.js';

describe('defaultFilenameBase', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('result ends with -bitmapped', () => {
    const result = defaultFilenameBase();
    expect(result).toMatch(/-bitmapped$/);
  });

  it('result contains only alphanumeric chars and hyphens', () => {
    const result = defaultFilenameBase();
    expect(result).toMatch(/^[a-zA-Z0-9-]+$/);
  });

  it('result has expected length of 25 chars', () => {
    const result = defaultFilenameBase();
    // 15 chars from ISO slice + '-bitmapped' (10 chars) = 25
    expect(result).toHaveLength(25);
  });

  it('produces exact output for a known timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T14:30:00Z'));

    const result = defaultFilenameBase();
    expect(result).toBe('20240615-143000-bitmapped');
  });
});
