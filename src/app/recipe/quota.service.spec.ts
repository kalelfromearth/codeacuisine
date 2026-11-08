import { isQuotaUsedUp, readQuota, readWaitSeconds } from './quota.service';

describe('readQuota', function () {
  it('returns the limit and the remaining runs of a normal answer', function () {
    expect(readQuota({ status: 'ok', limit: 3, remaining: 2 })).toEqual({ limit: 3, remaining: 2 });
  });

  it('accepts zero remaining runs', function () {
    expect(readQuota({ limit: 3, remaining: 0 })).toEqual({ limit: 3, remaining: 0 });
  });

  it('returns null for an answer of the wrong shape', function () {
    expect(readQuota(null)).toBeNull();
    expect(readQuota('3')).toBeNull();
    expect(readQuota({ limit: 3 })).toBeNull();
    expect(readQuota({ limit: '3', remaining: '2' })).toBeNull();
  });

  it('returns null for numbers that cannot be a count', function () {
    expect(readQuota({ limit: 3, remaining: -1 })).toBeNull();
    expect(readQuota({ limit: 3.5, remaining: 2 })).toBeNull();
    expect(readQuota({ limit: 3, remaining: Number.NaN })).toBeNull();
  });
});

describe('isQuotaUsedUp', function () {
  it('is true when the quota of the IP or of the app is used up', function () {
    expect(isQuotaUsedUp('quota-ip')).toBe(true);
    expect(isQuotaUsedUp('quota-total')).toBe(true);
  });

  it('is false for a short wait and for unknown reasons', function () {
    expect(isQuotaUsedUp('too-fast')).toBe(false);
    expect(isQuotaUsedUp(undefined)).toBe(false);
    expect(isQuotaUsedUp(429)).toBe(false);
  });
});

describe('readWaitSeconds', function () {
  it('returns the seconds of a too-fast answer', function () {
    expect(readWaitSeconds('too-fast', 16)).toBe(16);
  });

  it('returns 0 for every other reason', function () {
    expect(readWaitSeconds('quota-ip', 16)).toBe(0);
    expect(readWaitSeconds(undefined, 16)).toBe(0);
  });

  it('returns 0 for seconds that cannot be a wait', function () {
    expect(readWaitSeconds('too-fast', 0)).toBe(0);
    expect(readWaitSeconds('too-fast', -3)).toBe(0);
    expect(readWaitSeconds('too-fast', 2.5)).toBe(0);
    expect(readWaitSeconds('too-fast', '16')).toBe(0);
    expect(readWaitSeconds('too-fast', 100000)).toBe(0);
  });
});
