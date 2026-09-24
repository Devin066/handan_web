import type { ThemeConfig } from 'antd';

/**
 * Design tokens for the whole app. Ant Design derives its component styling from
 * these, so this file is the single place to change the look — components should
 * not carry their own colours.
 *
 * Direction: "data-dense dashboard" — Handlathe orange for primary actions and
 * the current location, a near-black sidebar matching the logo, red reserved
 * for things that need an operator's attention, data density over whitespace.
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
  background: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  primarySubtle: '#FFF1E6',

  // Sidebar chrome: near-black, matching the logo's own black ground, so the
  // wordmark sits in the rail instead of on a badge.
  chrome: '#141414',
  chromeHover: '#262626',
  chromeSelected: '#F86901',
  chromeText: '#D4D4D4',
  chromeTextMuted: '#A3A3A3',

  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
} as const;

export const monoStack = "'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace";

const fontStack =
  "'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

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

    borderRadius: 6,
    controlHeight: 34,
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
      itemSelectedBg: tokens.primarySubtle,
      itemSelectedColor: tokens.primaryText,
      itemHeight: 38,
      iconSize: 16,
    },

    Table: {
      headerBg: tokens.surfaceMuted,
      headerColor: tokens.textSecondary,
      headerSplitColor: 'transparent',
      rowHoverBg: '#F8FAFC',
      cellPaddingBlock: 10,
      cellPaddingInline: 12,
      borderColor: tokens.border,
    },

    Card: {
      headerBg: 'transparent',
      paddingLG: 20,
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
    },
  },
};

export default theme;
