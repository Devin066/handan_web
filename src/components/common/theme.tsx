import type { ThemeConfig } from 'antd';

/**
 * Design tokens for the whole app. Ant Design derives its component styling from
 * these, so this file is the single place to change the look — components should
 * not carry their own colours.
 *
 * Direction: "data-dense dashboard" — navy for structure and primary actions,
 * amber reserved for things that need an operator's attention, generous data
 * density over decorative whitespace.
 */

export const tokens = {
  // Navy carries structure and primary actions.
  primary: '#1E40AF',
  primaryHover: '#1D4ED8',
  primaryActive: '#1E3A8A',

  // Amber is reserved for "needs attention". Used sparingly so it keeps meaning.
  accent: '#D97706',

  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',
  info: '#0369A1',

  // Surfaces. The app background is a cool grey so white cards and tables lift
  // off it without needing heavy shadows.
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',

  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
} as const;

const fontStack =
  "'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const theme: ThemeConfig = {
  token: {
    colorPrimary: tokens.primary,
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
      itemSelectedBg: '#EFF6FF',
      itemSelectedColor: tokens.primary,
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
      defaultShadow: 'none',

      fontWeight: 500,
    },
  },
};

export default theme;
