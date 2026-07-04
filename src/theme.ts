// ReadNote 主题配置
export const Colors = {
  primary: '#4A90D9',
  primaryDark: '#357ABD',
  primaryLight: '#6BA5E7',

  bg: '#F0F2F5',
  bgCard: '#FFFFFF',
  bgDark: '#1A1A2E',
  bgTerminal: '#0D1117',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textTerminal: '#00FF88',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: '#000000',
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const FontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, title: 22,
};

export const BorderRadius = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};
