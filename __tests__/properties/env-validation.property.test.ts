// Feature: website-template-repo, Property 10: Environment validation distinguishes required vs optional

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

// Optional env var keys from the schema
const OPTIONAL_KEYS = [
  'NEXT_PUBLIC_GA_ID',
  'AXIOM_TOKEN',
  'AXIOM_DATASET',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'DISCORD_WEBHOOK_URL',
  'VERCEL_TOKEN',
  'NETLIFY_AUTH_TOKEN',
] as const;

describe('Property 10: Environment validation distinguishes required vs optional', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  /**
   * Validates: Requirements 28.2, 28.3
   *
   * For any subset of optional vars being present/absent,
   * if NEXT_PUBLIC_SITE_URL is set to a valid URL, validateEnv() should NOT throw.
   */
  it('should not throw when NEXT_PUBLIC_SITE_URL is a valid URL regardless of optional vars', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        // Generate a record of optional keys → boolean (present or absent)
        fc.record(
          Object.fromEntries(
            OPTIONAL_KEYS.map((key) => [key, fc.boolean()]),
          ) as { [K in (typeof OPTIONAL_KEYS)[number]]: fc.Arbitrary<boolean> },
        ),
        // Generate random string values for optional vars that are "present"
        fc.string({ minLength: 1, maxLength: 50 }),
        async (validUrl, optionalPresence, optionalValue) => {
          // Reset modules so validateEnv re-reads process.env
          vi.resetModules();

          // Build a clean env with only our controlled vars
          const testEnv: Record<string, string> = {
            NODE_ENV: 'test',
            NEXT_PUBLIC_SITE_URL: validUrl,
          };

          for (const key of OPTIONAL_KEYS) {
            if (optionalPresence[key]) {
              testEnv[key] = optionalValue;
            }
          }

          process.env = testEnv as NodeJS.ProcessEnv;

          const { validateEnv } = await import('@/lib/env');
          expect(() => validateEnv()).not.toThrow();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 28.2, 28.3
   *
   * If NEXT_PUBLIC_SITE_URL is missing or empty, validateEnv() should ALWAYS throw
   * regardless of which optional vars are present.
   */
  it('should throw when NEXT_PUBLIC_SITE_URL is missing regardless of optional vars', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a record of optional keys → boolean (present or absent)
        fc.record(
          Object.fromEntries(
            OPTIONAL_KEYS.map((key) => [key, fc.boolean()]),
          ) as { [K in (typeof OPTIONAL_KEYS)[number]]: fc.Arbitrary<boolean> },
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (optionalPresence, optionalValue) => {
          vi.resetModules();

          // Build env WITHOUT NEXT_PUBLIC_SITE_URL
          const testEnv: Record<string, string> = { NODE_ENV: 'test' };

          for (const key of OPTIONAL_KEYS) {
            if (optionalPresence[key]) {
              testEnv[key] = optionalValue;
            }
          }

          process.env = testEnv as NodeJS.ProcessEnv;

          const { validateEnv } = await import('@/lib/env');
          expect(() => validateEnv()).toThrow();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Validates: Requirements 28.3
   *
   * When optional vars are missing but required var is valid,
   * console.warn should be called for each missing optional var.
   */
  it('should warn for each missing optional var when required var is valid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        // Generate a subset of optional keys to be absent
        fc.subarray([...OPTIONAL_KEYS], { minLength: 1 }),
        async (validUrl, absentKeys) => {
          vi.resetModules();
          const warnSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => {});

          const testEnv: Record<string, string> = {
            NODE_ENV: 'test',
            NEXT_PUBLIC_SITE_URL: validUrl,
          };
          for (const key of OPTIONAL_KEYS) {
            if (!absentKeys.includes(key)) {
              testEnv[key] = 'some-value';
            }
          }

          process.env = testEnv as NodeJS.ProcessEnv;

          const { validateEnv } = await import('@/lib/env');
          validateEnv();

          // Each absent key should produce a warning
          for (const key of absentKeys) {
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(key));
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
