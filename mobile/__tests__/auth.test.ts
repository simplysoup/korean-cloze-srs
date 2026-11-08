/**
 * Local-auth logic tests: pure functions only (validation, SHA-256,
 * password hashing, SRS rank labels). The DB-backed parts (users table,
 * session, migration) are exercised through the app, not Jest, because
 * expo-sqlite needs a native/web runtime.
 */
import { sha256Hex } from '../src/lib/sha256';
import {
  generateSalt,
  hashPassword,
  isLogoutGraceActive,
  LOGOUT_GRACE_MS,
  usernameFromEmail,
  validateCode,
  validateEmail,
  validatePasswordSet,
  verifyPassword,
} from '../src/lib/auth';
import { srsRankLabel } from '../src/lib/srs';

describe('sha256Hex', () => {
  it.each([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
    ['hello', '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'],
    ['안녕하세요', '2c68318e352971113645cbc72861e1ec23f48d5baa5f9b405fed9dddca893eb4'],
  ])('hashes %p', (input, expected) => {
    expect(sha256Hex(input)).toBe(expected);
  });
});

describe('validateEmail', () => {
  it('requires a valid email', () => {
    expect(validateEmail('')).toBeDefined();
    expect(validateEmail('not-an-email')).toBeDefined();
    expect(validateEmail('a@b.co')).toBeUndefined();
    expect(validateEmail('  Nick@Example.com ')).toBeUndefined();
  });
});

describe('validateCode', () => {
  it('requires exactly 6 digits', () => {
    expect(validateCode('')).toBeDefined();
    expect(validateCode('12345')).toBeDefined();
    expect(validateCode('1234567')).toBeDefined();
    expect(validateCode('12a456')).toBeDefined();
    expect(validateCode('123456')).toBeUndefined();
  });
});

describe('validatePasswordSet', () => {
  it('requires an 8+ character password and a matching confirmation', () => {
    expect(validatePasswordSet('short', 'short').password).toBeDefined();
    expect(validatePasswordSet('correct-horse', 'different').confirmPassword).toBeDefined();
    expect(validatePasswordSet('correct-horse', 'correct-horse')).toEqual({});
  });
});

describe('usernameFromEmail', () => {
  it('derives a display name from the email local part', () => {
    expect(usernameFromEmail('nick.bode+test@example.com')).toBe('nickbode');
    expect(usernameFromEmail('a@b.co')).toBe('a');
    expect(usernameFromEmail('@@@')).toBe('learner');
  });
});

describe('isLogoutGraceActive', () => {
  const now = Date.parse('2026-11-08T12:00:00.000Z');

  it('is active when never logged out or inside the 30-minute grace', () => {
    expect(isLogoutGraceActive(null, now)).toBe(true);
    expect(isLogoutGraceActive(new Date(now - 29 * 60 * 1000).toISOString(), now)).toBe(true);
    expect(isLogoutGraceActive(new Date(now - LOGOUT_GRACE_MS).toISOString(), now)).toBe(true);
  });

  it('expires past 30 minutes', () => {
    expect(isLogoutGraceActive(new Date(now - LOGOUT_GRACE_MS - 1000).toISOString(), now)).toBe(false);
    expect(isLogoutGraceActive('not-a-date', now)).toBe(false);
  });
});

describe('hashPassword / verifyPassword', () => {
  it('is deterministic for a given salt and verifies correctly', () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const hash = hashPassword('correct-horse', salt);
    expect(verifyPassword('correct-horse', salt, hash)).toBe(true);
    expect(verifyPassword('wrong-horse', salt, hash)).toBe(false);
  });

  it('differs across salts', () => {
    expect(hashPassword('same-password', 'a'.repeat(32))).not.toBe(
      hashPassword('same-password', 'b'.repeat(32)),
    );
  });

  it('generates a 32-char hex salt', () => {
    expect(generateSalt()).toMatch(/^[0-9a-f]{32}$/);
    expect(generateSalt()).not.toBe(generateSalt());
  });
});

describe('srsRankLabel', () => {
  it('labels new, learning, and mastered cards', () => {
    expect(srsRankLabel(0, 0, false)).toBe('New');
    expect(srsRankLabel(1, 0.5, false)).toBe('Beginner I');
    expect(srsRankLabel(3, 0.5, false)).toBe('Beginner I');
    expect(srsRankLabel(2, 0.5, true)).toBe('Master');
  });

  it('bands review cards by stability', () => {
    expect(srsRankLabel(2, 1, false)).toBe('Beginner II');
    expect(srsRankLabel(2, 5, false)).toBe('Beginner III');
    expect(srsRankLabel(2, 10, false)).toBe('Beginner IV');
    expect(srsRankLabel(2, 20, false)).toBe('Seasoned I');
    expect(srsRankLabel(2, 60, false)).toBe('Seasoned II');
    expect(srsRankLabel(2, 120, false)).toBe('Seasoned III');
    expect(srsRankLabel(2, 365, false)).toBe('Master');
  });
});
