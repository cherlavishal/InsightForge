// InsightForge Theme Configuration
// This file provides theme configuration for both Tailwind and JavaScript usage

export const theme = {
  // Color palette
  colors: {
    // Primary colors - Blue spectrum
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Secondary colors - Gray spectrum
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Success colors - Green spectrum
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    
    // Warning colors - Yellow/Orange spectrum
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    
    // Error colors - Red spectrum
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    
    // Info colors - Cyan spectrum
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    
    // Additional colors for charts and UI
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
      950: '#500724',
    },
    
    // Semantic colors
    background: {
      light: '#ffffff',
      dark: '#0f172a',
      card: {
        light: '#f8fafc',
        dark: '#1e293b',
      },
      sidebar: {
        light: '#f1f5f9',
        dark: '#1e293b',
      },
      modal: {
        light: 'rgba(255, 255, 255, 0.8)',
        dark: 'rgba(15, 23, 42, 0.8)',
      },
    },
    
    text: {
      primary: {
        light: '#0f172a',
        dark: '#f8fafc',
      },
      secondary: {
        light: '#475569',
        dark: '#cbd5e1',
      },
      muted: {
        light: '#94a3b8',
        dark: '#64748b',
      },
      disabled: {
        light: '#cbd5e1',
        dark: '#475569',
      },
    },
    
    border: {
      light: '#e2e8f0',
      dark: '#334155',
      focus: {
        light: '#3b82f6',
        dark: '#60a5fa',
      },
      divider: {
        light: '#f1f5f9',
        dark: '#1e293b',
      },
    },
    
    // Chart color sequences
    chart: {
      sequential: [
        '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
        '#172554', '#0f172a', '#020617'
      ],
      categorical: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
      ],
      diverging: [
        '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2',
        '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'
      ],
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem',     // 128px
    },
    
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem',     // 384px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    
    // Custom shadows
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    hard: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    glow: '0 0 20px rgba(59, 130, 246, 0.5)',
  },
  
  // Animations
  animations: {
    durations: {
      fastest: '75ms',
      faster: '100ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },
    
    timingFunctions: {
      linear: 'linear',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideInUp: {
        '0%': { transform: 'translateY(100%)' },
        '100%': { transform: 'translateY(0)' },
      },
      slideInDown: {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(0)' },
      },
      slideInLeft: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      slideInRight: {
        '0%': { transform: 'translateX(100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.95)', opacity: '0' },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      ping: {
        '75%, 100%': { transform: 'scale(2)', opacity: '0' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
        '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
      },
      shimmer: {
        '100%': { transform: 'translateX(100%)' },
      },
    },
  },
  
  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-Index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Components
  components: {
    button: {
      sizes: {
        xs: { padding: '0.5rem 0.75rem', fontSize: '0.75rem' },
        sm: { padding: '0.625rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
        xl: { padding: '1.25rem 2.5rem', fontSize: '1.25rem' },
      },
      variants: {
        primary: {
          backgroundColor: 'var(--primary-500)',
          color: 'white',
          hover: { backgroundColor: 'var(--primary-600)' },
          active: { backgroundColor: 'var(--primary-700)' },
          disabled: { backgroundColor: 'var(--primary-300)', opacity: 0.5 },
        },
        secondary: {
          backgroundColor: 'var(--secondary-100)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          hover: { backgroundColor: 'var(--secondary-200)' },
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'var(--primary-600)',
          border: '1px solid var(--primary-600)',
          hover: { backgroundColor: 'var(--primary-50)' },
        },
        ghost: {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          hover: { backgroundColor: 'var(--secondary-100)' },
        },
        link: {
          backgroundColor: 'transparent',
          color: 'var(--primary-600)',
          textDecoration: 'underline',
          hover: { color: 'var(--primary-700)' },
        },
      },
    },
    
    card: {
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backgroundColor: 'var(--background-card)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
    },
    
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid var(--input)',
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)',
      focus: {
        borderColor: 'var(--ring)',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        outline: 'none',
      },
      disabled: {
        backgroundColor: 'var(--muted)',
        color: 'var(--text-disabled)',
        cursor: 'not-allowed',
      },
    },
    
    table: {
      header: {
        backgroundColor: 'var(--secondary-50)',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        padding: '0.75rem 1rem',
        borderBottom: '2px solid var(--border)',
      },
      cell: {
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border)',
      },
      row: {
        hover: {
          backgroundColor: 'var(--secondary-50)',
        },
      },
    },
    
    modal: {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      },
      content: {
        backgroundColor: 'var(--background)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
      },
    },
  },
};

// Theme utilities
export const getThemeMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('insightforge_theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  return 'light';
};

export const setThemeMode = (mode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('insightforge_theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
};

export const toggleTheme = () => {
  const currentMode = getThemeMode();
  const newMode = currentMode === 'dark' ? 'light' : 'dark';
  setThemeMode(newMode);
  return newMode;
};

export const initTheme = () => {
  const mode = getThemeMode();
  setThemeMode(mode);
  return mode;
};

// Chart theme configuration
export const chartTheme = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    gridColor: '#e2e8f0',
    borderColor: '#cbd5e1',
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textColor: '#0f172a',
    },
    legend: {
      textColor: '#475569',
    },
  },
  dark: {
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    gridColor: '#334155',
    borderColor: '#475569',
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textColor: '#f8fafc',
    },
    legend: {
      textColor: '#94a3b8',
    },
  },
};

// Export theme CSS variables for use in CSS-in-JS
export const cssVariables = {
  light: {
    '--background': theme.colors.background.light,
    '--foreground': theme.colors.text.primary.light,
    '--primary': theme.colors.primary[500],
    '--primary-foreground': theme.colors.primary[50],
    '--secondary': theme.colors.secondary[100],
    '--secondary-foreground': theme.colors.text.primary.light,
    '--muted': theme.colors.secondary[100],
    '--muted-foreground': theme.colors.text.muted.light,
    '--accent': theme.colors.secondary[100],
    '--accent-foreground': theme.colors.text.primary.light,
    '--destructive': theme.colors.error[500],
    '--destructive-foreground': theme.colors.error[50],
    '--border': theme.colors.border.light,
    '--input': theme.colors.border.light,
    '--ring': theme.colors.primary[500],
  },
  dark: {
    '--background': theme.colors.background.dark,
    '--foreground': theme.colors.text.primary.dark,
    '--primary': theme.colors.primary[500],
    '--primary-foreground': theme.colors.primary[950],
    '--secondary': theme.colors.secondary[800],
    '--secondary-foreground': theme.colors.text.primary.dark,
    '--muted': theme.colors.secondary[800],
    '--muted-foreground': theme.colors.text.muted.dark,
    '--accent': theme.colors.secondary[800],
    '--accent-foreground': theme.colors.text.primary.dark,
    '--destructive': theme.colors.error[500],
    '--destructive-foreground': theme.colors.error[950],
    '--border': theme.colors.border.dark,
    '--input': theme.colors.border.dark,
    '--ring': theme.colors.primary[500],
  },
};

export default theme;