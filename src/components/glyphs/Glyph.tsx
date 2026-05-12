import type { ReactNode } from 'react';

/**
 * Canonical names for the Signal icon vocabulary (v1).
 *
 * Six categories, 17 glyphs total:
 * - Buildings:       hospital, office, server-room, data-centre
 * - Roles:           clinician, employee, attacker
 * - Network states:  network-secure, network-unsecured, network-breached
 * - Data states:     data-at-rest, data-in-transit, data-exposed
 * - Shared:          encrypted (works for network or data context)
 * - Outcomes:        warning, breach, compliance-pass
 *
 * State variants are separate glyphs, not props. Colours are baked in via
 * CSS variables (--green, --gold, --red) declared in global.css.
 *
 * Extension principles for future glyphs:
 *   - 48x48 viewBox, 4px safe area (working area 40x40)
 *   - 2px stroke, square caps, miter joins
 *   - 3-7 visual elements per glyph
 *   - Must read clearly at 24px scale
 *   - Use only locked colour tokens; new colours require explicit token addition
 */
export type GlyphName =
  | 'hospital'
  | 'office'
  | 'server-room'
  | 'data-centre'
  | 'clinician'
  | 'employee'
  | 'attacker'
  | 'network-secure'
  | 'network-unsecured'
  | 'network-breached'
  | 'data-at-rest'
  | 'data-in-transit'
  | 'data-exposed'
  | 'encrypted'
  | 'warning'
  | 'breach'
  | 'compliance-pass';

const GLYPH_LABELS: Record<GlyphName, string> = {
  'hospital': 'Hospital',
  'office': 'Office',
  'server-room': 'Server room',
  'data-centre': 'Data centre',
  'clinician': 'Clinician',
  'employee': 'Employee',
  'attacker': 'Attacker',
  'network-secure': 'Network secure',
  'network-unsecured': 'Network unsecured',
  'network-breached': 'Network breached',
  'data-at-rest': 'Data at rest',
  'data-in-transit': 'Data in transit',
  'data-exposed': 'Data exposed',
  'encrypted': 'Encrypted',
  'warning': 'Warning',
  'breach': 'Breach',
  'compliance-pass': 'Compliance pass',
};

const GLYPH_SHAPES: Record<GlyphName, ReactNode> = {
  'hospital': (
    <>
      <path d="M6 10 L26 10 L26 24 L42 24 L42 42 L6 42 Z" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <line x1="16" y1="13" x2="16" y2="21" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="12" y1="17" x2="20" y2="17" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="30" y1="31" x2="38" y2="31" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="30" y1="37" x2="38" y2="37" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'office': (
    <>
      <path d="M10 14 L18 14 L18 8 L30 8 L30 14 L38 14 L38 42 L10 42 Z" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <line x1="14" y1="20" x2="34" y2="20" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="14" y1="26" x2="34" y2="26" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="14" y1="32" x2="34" y2="32" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="14" y1="38" x2="34" y2="38" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'server-room': (
    <>
      <rect x="8" y="12" width="32" height="30" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <rect x="22" y="16" width="4" height="22" fill="var(--green)" />
      <rect x="23" y="13" width="2" height="2" fill="var(--green)" />
    </>
  ),
  'data-centre': (
    <>
      <path d="M4 18 L18 18 L18 12 L30 12 L30 18 L44 18 L44 42 L4 42 Z" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <rect x="9" y="24" width="2" height="14" fill="var(--green)" />
      <rect x="17" y="24" width="2" height="14" fill="var(--green)" />
      <rect x="27" y="24" width="2" height="14" fill="var(--green)" />
      <rect x="35" y="24" width="2" height="14" fill="var(--green)" />
    </>
  ),
  'clinician': (
    <>
      <rect x="20" y="8" width="8" height="8" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <rect x="14" y="18" width="20" height="20" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <line x1="24" y1="23" x2="24" y2="29" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="21" y1="26" x2="27" y2="26" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'employee': (
    <>
      <rect x="20" y="8" width="8" height="8" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <rect x="14" y="18" width="20" height="20" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <line x1="24" y1="18" x2="24" y2="30" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'attacker': (
    <>
      <path d="M20 8 L28 8 L36 18 L32 36 L24 42 L16 36 L12 18 Z" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <rect x="15" y="20" width="6" height="3" fill="var(--green)" />
      <rect x="27" y="20" width="6" height="3" fill="var(--green)" />
    </>
  ),
  'network-secure': (
    <>
      <rect x="8" y="22" width="4" height="4" fill="var(--green)" />
      <rect x="36" y="22" width="4" height="4" fill="var(--green)" />
      <line x1="12" y1="24" x2="36" y2="24" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <path d="M22 18 L22 14 L26 14 L26 18" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <rect x="20" y="18" width="8" height="4" fill="var(--green)" />
    </>
  ),
  'network-unsecured': (
    <>
      <rect x="8" y="22" width="4" height="4" fill="var(--gold)" />
      <rect x="36" y="22" width="4" height="4" fill="var(--gold)" />
      <line x1="12" y1="24" x2="36" y2="24" stroke="var(--gold)" strokeWidth="2" strokeLinecap="square" />
      <line x1="24" y1="14" x2="24" y2="18" stroke="var(--gold)" strokeWidth="2" strokeLinecap="square" />
      <rect x="23" y="20" width="2" height="2" fill="var(--gold)" />
    </>
  ),
  'network-breached': (
    <>
      <rect x="8" y="22" width="4" height="4" fill="var(--red)" />
      <rect x="36" y="22" width="4" height="4" fill="var(--red)" />
      <line x1="12" y1="24" x2="20" y2="24" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
      <line x1="28" y1="24" x2="36" y2="24" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
      <line x1="21" y1="21" x2="27" y2="27" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
      <line x1="27" y1="21" x2="21" y2="27" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'data-at-rest': (
    <>
      <rect x="12" y="14" width="24" height="20" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <line x1="12" y1="20" x2="36" y2="20" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
      <line x1="12" y1="27" x2="36" y2="27" stroke="var(--green)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'data-in-transit': (
    <>
      <rect x="12" y="14" width="24" height="20" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="miter" />
      <line x1="12" y1="20" x2="36" y2="20" stroke="var(--gold)" strokeWidth="2" strokeLinecap="square" />
      <line x1="12" y1="27" x2="36" y2="27" stroke="var(--gold)" strokeWidth="2" strokeLinecap="square" />
      <path d="M38 21 L42 24 L38 27 Z" fill="var(--gold)" />
    </>
  ),
  'data-exposed': (
    <>
      <path d="M12 14 L28 14 L36 22 L36 34 L12 34 Z" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <line x1="12" y1="20" x2="34" y2="20" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
      <line x1="12" y1="27" x2="36" y2="27" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'encrypted': (
    <>
      <path d="M18 22 L18 14 L30 14 L30 22" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <rect x="14" y="22" width="20" height="18" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" />
      <rect x="22" y="29" width="4" height="4" fill="var(--green)" />
    </>
  ),
  'warning': (
    <>
      <path d="M24 8 L40 36 L8 36 Z" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <line x1="24" y1="18" x2="24" y2="28" stroke="var(--gold)" strokeWidth="2" strokeLinecap="square" />
      <rect x="23" y="30" width="2" height="2" fill="var(--gold)" />
    </>
  ),
  'breach': (
    <>
      <path d="M24 8 L36 16 L36 32 L24 40 L12 32 L12 16 Z" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <line x1="16" y1="16" x2="32" y2="32" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
      <line x1="32" y1="16" x2="16" y2="32" stroke="var(--red)" strokeWidth="2" strokeLinecap="square" />
    </>
  ),
  'compliance-pass': (
    <>
      <path d="M24 8 L36 16 L36 32 L24 40 L12 32 L12 16 Z" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
      <path d="M14 24 L20 30 L34 16" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="square" />
    </>
  ),
};

export interface GlyphProps {
  name: GlyphName;
  size?: number;
  className?: string;
}

/**
 * Renders a Signal icon vocabulary glyph as an inline SVG.
 *
 * @example
 *   <Glyph name="hospital" />
 *   <Glyph name="data-in-transit" size={24} />
 *   <Glyph name="network-breached" className="scenario-icon" />
 *
 * Defaults to 48x48. Colours are sourced from CSS variables
 * (--green, --gold, --red) declared in global.css.
 */
export function Glyph({ name, size = 48, className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={GLYPH_LABELS[name]}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{GLYPH_LABELS[name]}</title>
      {GLYPH_SHAPES[name]}
    </svg>
  );
}
