// Feature: website-template-repo, Property 11: CSP builder produces valid header from config

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildCSP, type CSPConfig } from '@/lib/csp';

/**
 * Arbitrary generator for CSP domain-like source strings.
 * Produces values like "'self'", "'none'", "https://example.com", "*.example.com", "data:", etc.
 */
const cspSourceArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant("'self'"),
  fc.constant("'none'"),
  fc.constant("'unsafe-inline'"),
  fc.constant("'unsafe-eval'"),
  fc.constant('data:'),
  fc.constant('blob:'),
  fc.constant('https:'),
  // Domain-style sources
  fc
    .tuple(
      fc.boolean(), // wildcard subdomain?
      fc.stringMatching(/^[a-z][a-z0-9-]{1,20}$/),
      fc.constantFrom('.com', '.org', '.net', '.io', '.dev'),
    )
    .map(([wildcard, name, tld]) =>
      wildcard ? `*.${name}${tld}` : `https://${name}${tld}`,
    ),
);

/** Generate a non-empty array of unique CSP sources. */
const cspSourceListArb: fc.Arbitrary<string[]> = fc
  .uniqueArray(cspSourceArb, { minLength: 1, maxLength: 5 })
  .filter((arr) => arr.length > 0);

/** All array-type CSP directive names. */
const ARRAY_DIRECTIVES = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'connect-src',
  'font-src',
  'object-src',
  'media-src',
  'frame-src',
  'frame-ancestors',
  'base-uri',
  'form-action',
] as const;

/**
 * Arbitrary generator for CSPConfig objects.
 * Randomly includes a subset of directives with random source lists.
 */
const cspConfigArb: fc.Arbitrary<CSPConfig> = fc
  .subarray([...ARRAY_DIRECTIVES], { minLength: 1 })
  .chain((directives) => {
    const entries = directives.map(
      (d) => [d, cspSourceListArb] as [string, fc.Arbitrary<string[]>],
    );
    const record: Record<string, fc.Arbitrary<string[]>> = {};
    for (const [key, arb] of entries) {
      record[key] = arb;
    }
    return fc.record(record) as unknown as fc.Arbitrary<CSPConfig>;
  });

describe('Property 11: CSP builder produces valid header from config', () => {
  /**
   * Validates: Requirements 29.3
   *
   * For any set of allowed domain strings, the CSP builder function should
   * produce a Content-Security-Policy header string that includes each provided
   * domain in the appropriate directive and conforms to CSP syntax
   * (semicolon-separated directives, space-separated sources).
   */
  it('should produce a valid CSP string containing all configured domains with correct directive syntax', () => {
    fc.assert(
      fc.property(cspConfigArb, (config) => {
        const result = buildCSP(config);

        // Result must be a non-empty string
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);

        // Directives are semicolon-separated
        const directives = result.split('; ');

        // Each directive must be either "upgrade-insecure-requests" (no sources)
        // or "directive-name source1 source2 ..."
        for (const directive of directives) {
          if (directive === 'upgrade-insecure-requests') continue;

          const parts = directive.split(' ');
          // Must have at least a directive name and one source
          expect(parts.length).toBeGreaterThanOrEqual(2);

          // Directive name must be a known CSP directive
          const directiveName = parts[0];
          expect(
            [...ARRAY_DIRECTIVES, 'upgrade-insecure-requests'].includes(
              directiveName as (typeof ARRAY_DIRECTIVES)[number],
            ),
          ).toBe(true);

          // Sources are space-separated (already verified by split)
          const sources = parts.slice(1);
          for (const source of sources) {
            expect(source.length).toBeGreaterThan(0);
            // No source should contain a semicolon (that would break directive separation)
            expect(source).not.toContain(';');
          }
        }

        // Every user-provided domain must appear in the output
        for (const [directive, sources] of Object.entries(config)) {
          if (directive === 'upgrade-insecure-requests') continue;
          if (!Array.isArray(sources)) continue;

          for (const source of sources) {
            expect(result).toContain(source);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
