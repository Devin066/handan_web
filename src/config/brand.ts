/**
 * Product branding.
 *
 * The application itself is generic ERP/MES software — everything else in the
 * codebase (package name, database, env vars, demo data) deliberately carries no
 * brand, so the same build can be deployed for a different company by changing
 * these values alone.
 *
 * Set NEXT_PUBLIC_APP_NAME at build time to re-brand. It is inlined into the
 * client bundle, so a change requires a rebuild, not just a restart.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Handlathe',
  /** Shown in the browser tab, after the page name. */
  get titleSuffix() {
    return this.name;
  },
  /** Where the "Help" action points. */
  helpUrl: process.env.NEXT_PUBLIC_APP_HELP_URL || 'https://debinlabs.com',
} as const;

export default brand;
