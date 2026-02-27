// Feature: website-template-repo, Property 7: Secret-guarded workflows have skip conditionals

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import fs from "node:fs";
import path from "node:path";

/**
 * Known mapping of workflow files to the secrets/vars they guard on.
 * Each entry is a [workflowFile, guardString] pair where guardString is
 * the expression that must appear in an `if` conditional within the file.
 *
 * For secrets: the guard checks `secrets.SECRET_NAME != ''`
 * For vars: the guard checks `vars.VAR_NAME == 'true'`
 */
const WORKFLOW_SECRET_PAIRS: Array<{ workflow: string; secret: string; guardPattern: string }> = [
  // security.yml
  { workflow: "security.yml", secret: "TRIVY_ENABLED", guardPattern: "vars.TRIVY_ENABLED" },
  { workflow: "security.yml", secret: "SNYK_TOKEN", guardPattern: "secrets.SNYK_TOKEN" },
  { workflow: "security.yml", secret: "SAFETY_API_KEY", guardPattern: "secrets.SAFETY_API_KEY" },
  // lighthouse.yml
  { workflow: "lighthouse.yml", secret: "LHCI_GITHUB_APP_TOKEN", guardPattern: "secrets.LHCI_GITHUB_APP_TOKEN" },
  // deploy-preview.yml
  { workflow: "deploy-preview.yml", secret: "VERCEL_TOKEN", guardPattern: "secrets.VERCEL_TOKEN" },
  { workflow: "deploy-preview.yml", secret: "NETLIFY_AUTH_TOKEN", guardPattern: "secrets.NETLIFY_AUTH_TOKEN" },
  // deploy-production.yml
  { workflow: "deploy-production.yml", secret: "VERCEL_TOKEN", guardPattern: "secrets.VERCEL_TOKEN" },
  { workflow: "deploy-production.yml", secret: "NETLIFY_AUTH_TOKEN", guardPattern: "secrets.NETLIFY_AUTH_TOKEN" },
  // sonarqube.yml
  { workflow: "sonarqube.yml", secret: "SONAR_TOKEN", guardPattern: "secrets.SONAR_TOKEN" },
  // qlty.yml
  { workflow: "qlty.yml", secret: "QLTY_TOKEN", guardPattern: "secrets.QLTY_TOKEN" },
  // discord-notify.yml
  { workflow: "discord-notify.yml", secret: "DISCORD_WEBHOOK_URL", guardPattern: "secrets.DISCORD_WEBHOOK_URL" },
  // ci.yml (step-level guard)
  { workflow: "ci.yml", secret: "CODECOV_TOKEN", guardPattern: "secrets.CODECOV_TOKEN" },
];

const WORKFLOWS_DIR = path.resolve(__dirname, "../../.github/workflows");

describe("Property 7: Secret-guarded workflows have skip conditionals", () => {
  /**
   * Validates: Requirements 17.1
   *
   * For any workflow YAML file in `.github/workflows/` that references an
   * optional secret, the workflow should contain an `if` conditional that
   * checks for the presence of that secret before running the guarded job.
   */
  it("should contain an if conditional checking for each guarded secret", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...WORKFLOW_SECRET_PAIRS),
        ({ workflow, secret, guardPattern }) => {
          const filePath = path.join(WORKFLOWS_DIR, workflow);

          // The workflow file must exist
          expect(fs.existsSync(filePath)).toBe(true);

          const content = fs.readFileSync(filePath, "utf-8");

          // The file must contain an `if:` line that references the guard pattern
          // This verifies the workflow has a conditional checking for the secret
          const hasIfGuard =
            content.includes("if:") && content.includes(guardPattern);

          expect(hasIfGuard).toBe(true);

          // The guard must specifically check for non-empty value (!= '') or enabled state.
          // The check may appear in a YAML `if:` or inside a bash script block.
          const presencePatterns = [
            `${guardPattern} != ''`,
            `${guardPattern} == 'true'`,
            `${guardPattern} }}" != ''`,
            `${guardPattern} }}" == 'true'`,
          ];
          const hasPresenceCheck = presencePatterns.some((p) =>
            content.includes(p),
          );

          expect(hasPresenceCheck).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
