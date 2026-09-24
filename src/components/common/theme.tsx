import type { ThemeConfig } from 'antd';

/**
 * Design tokens for the whole app. Ant Design derives its component styling from
 * these, so this file is the single place to change the look — components should
 * not carry their own colours.
 *
 * Direction: Google (Material 3) — a light navigation drawer that shares the
 * page background, a tonal orange pill for the current location, pill buttons,
 * outlined fields, white 16px-radius surfaces without borders or shadows, and
 * Handlathe orange kept for primary actions. Red is reserved for attention.
 */

export const tokens = {
  // Handlathe orange (brand) carries primary actions and the current location.
  // White on this orange is only ~2.9:1, so anything filled with it uses dark
  // text (onPrimary, ~5.7:1), and orange *text* on white uses the deeper
  // primaryText shade (~5.2:1).
  primary: '#F86901',
  primaryHover: '#FF7F1F',
  primaryActive: '#D95B00',
  primaryText: '#C2410C',
  onPrimary: '#1C1917',

  // "Needs attention" can no longer be amber: next to an orange brand it would
  // read as decoration. It is a restrained red, used sparingly.
  accent: '#B42318',

  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',
  info: '#0369A1',

  // Surfaces. The app background is a cool grey so white cards and tables lift
  // off it without needing heavy shadows.
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F4',
  primarySubtle: '#FFF1E6',
  // M3 primary container: the tonal fill behind the current nav item.
  primaryContainer: '#FFDBC9',
  onPrimaryContainer: '#331200',

  // Navigation drawer: same ground as the page, as in Gmail and Drive, with a
  // grey state layer on hover and the tonal container for the current item.
  chrome: '#F8F9FA',
  chromeHover: '#E8EAED',
  chromeSelected: '#FFDBC9',
  chromeText: '#444746',
  chromeTextMuted: '#5E5E5E',

  text: '#1F1F1F',
  textSecondary: '#444746',
  textTertiary: '#5E5E5E',
  border: '#E3E3E3',
  borderStrong: '#747775',
} as const;

// --font-sans / --font-mono are defined in src/pages/_app.tsx by next/font,
// which self-hosts Roboto and Roboto Mono and includes its own fallback stack.
export const monoStack = 'var(--font-mono), ui-monospace, monospace';

const fontStack = "'Google Sans Text', 'Google Sans', var(--font-sans), sans-serif";

const theme: ThemeConfig = {
  token: {
    colorPrimary: tokens.primary,
    colorPrimaryText: tokens.primaryText,
    colorPrimaryTextHover: tokens.primaryActive,
    colorLink: tokens.primaryText,
    colorLinkHover: tokens.primaryActive,
    colorLinkActive: tokens.primaryActive,
    colorSuccess: tokens.success,
    colorWarning: tokens.warning,
    colorError: tokens.danger,
    colorInfo: tokens.info,

    colorBgLayout: tokens.background,
    colorBgContainer: tokens.surface,
    colorBorderSecondary: tokens.border,
    colorBorder: tokens.borderStrong,

    colorText: tokens.text,
    colorTextSecondary: tokens.textSecondary,
    colorTextTertiary: tokens.textTertiary,

    fontFamily: fontStack,
    // 14px is the right base for operational tables: 16px forces too few columns
    // into view, and this is a dense read-heavy tool, not a reading surface.
    fontSize: 14,
    lineHeight: 1.5715,

    borderRadius: 8,
    borderRadiusLG: 16,
    borderRadiusSM: 6,
    controlHeight: 40,
    controlHeightSM: 32,
    boxShadow: 'none',
    boxShadowSecondary: '0 1px 2px rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
    wireframe: false,
  },

  components: {
    Layout: {
      bodyBg: tokens.background,
      headerBg: tokens.surface,
      siderBg: tokens.surface,
      headerHeight: 56,
      headerPadding: '0 16px',
    },

    Menu: {
      itemBg: tokens.surface,
      subMenuItemBg: tokens.surface,
      itemSelectedBg: tokens.primaryContainer,
      itemSelectedColor: tokens.onPrimaryContainer,
      itemHoverBg: tokens.chromeHover,
      itemBorderRadius: 100,
      itemHeight: 40,
      iconSize: 18,
    },

    Table: {
      headerBg: tokens.surface,
      headerColor: tokens.textSecondary,
      headerSplitColor: 'transparent',
      rowHoverBg: tokens.surfaceMuted,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
      borderColor: tokens.border,
    },

    Card: {
      headerBg: 'transparent',
      paddingLG: 24,
      headerFontSize: 16,
    },

    Statistic: {
      contentFontSize: 22,
      titleFontSize: 13,
    },

    Tag: {
      defaultBg: tokens.surfaceMuted,
      defaultColor: tokens.textSecondary,
    },

    Descriptions: {
      labelBg: tokens.surfaceMuted,
    },

    Button: {
      primaryShadow: 'none',
      primaryColor: tokens.onPrimary,
      defaultShadow: 'none',

      fontWeight: 500,
      // Material buttons are full pills.
      borderRadius: 20,
      borderRadiusLG: 24,
      borderRadiusSM: 16,
      paddingInline: 24,
    },

    Input: { activeShadow: 'none', paddingBlock: 8, paddingInline: 12 },
    Select: { optionSelectedBg: tokens.primaryContainer, optionSelectedColor: tokens.onPrimaryContainer },
    Modal: { borderRadiusLG: 28, titleFontSize: 22, contentBg: tokens.surface },
    Drawer: { colorBgElevated: tokens.surface },
    Tabs: { inkBarColor: tokens.primary, itemSelectedColor: tokens.primaryText, titleFontSize: 14 },
    Segmented: { itemSelectedBg: tokens.primaryContainer, itemSelectedColor: tokens.onPrimaryContainer },
  },
};

export default theme;
