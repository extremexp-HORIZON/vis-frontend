// Import necessary modules
import { grey, blue } from '@mui/material/colors';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import type { CSSProperties } from 'react';

// Custom typography variants (additive — used like <Typography variant="cardTitle">)
declare module '@mui/material/styles' {
  interface TypographyVariants {
    cardTitle: CSSProperties;
    statValue: CSSProperties;
    bodyCompact: CSSProperties;
    bodySm: CSSProperties;
    statLabel: CSSProperties;
    captionLabel: CSSProperties;
    mono: CSSProperties;
  }
  interface TypographyVariantsOptions {
    cardTitle?: CSSProperties;
    statValue?: CSSProperties;
    bodyCompact?: CSSProperties;
    bodySm?: CSSProperties;
    statLabel?: CSSProperties;
    captionLabel?: CSSProperties;
    mono?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    cardTitle: true;
    statValue: true;
    bodyCompact: true;
    bodySm: true;
    statLabel: true;
    captionLabel: true;
    mono: true;
  }
}

// Extend the existing palette interface to include custom properties
declare module '@mui/material/styles' {
  interface Palette {
    customPrimary: {
      main: string
    }
    customGradient: {
      gradient: string
      killedGradient: string
    }
    customGrey: {
      main: string
      dark: string
      light: string
      text: string
    }
    customBlue: {
      selected: string
    }
    customSurface: {
      /** Background for card / panel headers */
      cardHeader: string
      /** Background for settings section headers */
      sectionHeader: string
      /** Background for card content areas */
      cardContent: string
      /** Background for subdued stat tiles and tray areas */
      tray: string
      /** Track background for progress / split bars */
      barTrack: string
      /** Footer / dialog-actions background */
      footer: string
      /** Neutral/info stat card gradient */
      statCard: string
      /** Success stat card gradient */
      statCardSuccess: string
      /** Failure stat card gradient */
      statCardFailure: string
      /** Solid color for success indicators */
      statSuccess: string
      /** Solid color for failure indicators */
      statFailure: string
      /** Raised panel background (sits above background.paper in dark mode) */
      elevated: string
      /** Subtle border color for cards/panels — soft, never a harsh hairline */
      cardBorder: string
    }
    /** Categorical / diverging colors for data-viz (charts, splits, waterfalls). */
    chart: {
      /** Ordered categorical series palette — index into it for nth series. */
      categorical: string[]
      /** Diverging scale `[negative, neutral, positive]` for e.g. correlation. */
      diverging: [string, string, string]
      /** Neutral / "other" series color. */
      neutral: string
    }
  }
  interface PaletteOptions {
    customPrimary?: {
      main: string
    }
    customGradient?: {
      gradient: string
      killedGradient: string
    }
    customGrey?: {
      main: string
      dark: string
      light: string
      text: string
    }
    customBlue?: {
      selected: string
    }
    customSurface?: {
      cardHeader: string
      sectionHeader: string
      cardContent: string
      tray: string
      barTrack: string
      footer: string
      statCard: string
      statCardSuccess: string
      statCardFailure: string
      statSuccess: string
      statFailure: string
      elevated: string
      cardBorder: string
    }
    chart?: {
      categorical: string[]
      diverging: [string, string, string]
      neutral: string
    }
  }
}

// Reusable elevation tokens for the modern card surfaces. Unlike the MUI
// `shadows` scale these are tuned to read clearly on dark backgrounds.
declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      /** Resting elevation for cards / panels */
      card: string
      /** Lifted elevation on hover/active */
      cardHover: string
      /** Floating surfaces: menus, popovers, dialogs */
      popover: string
    }
  }
  interface ThemeOptions {
    customShadows?: {
      card: string
      cardHover: string
      popover: string
    }
  }
}

export type ThemeMode = 'light' | 'dark';

// Categorical data-viz palette. Tuned to read on both light and dark card
// surfaces, so the same array is used for either mode (Vega specs can't easily
// branch on theme). Use `theme.palette.chart.categorical` in components, or the
// plain `CHART_CATEGORICAL` / `CHART_DIVERGING` exports inside Vega `range`s.
export const CHART_CATEGORICAL = [
  '#3766AF', // primary blue
  '#6BBC8C', // secondary green
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#8b5cf6', // violet
  '#14b8a6', // teal
] as const;

/** Diverging scale `[negative, neutral, positive]`. */
export const CHART_DIVERGING: [string, string, string] = ['#ef4444', '#e8e8e8', '#22c55e'];

/** Neutral / "other" series color. */
export const CHART_NEUTRAL = '#64748b';

// Build a soft, layered elevation scale. MUI's default shadows are tuned for
// light surfaces and all but vanish on a dark background — these stay readable
// in both modes by pairing a tight contact shadow with a wider ambient one.
const buildShadows = (isDark: boolean): Shadows => {
  const rgb = isDark ? '0, 0, 0' : '16, 24, 40';
  const contactA = isDark ? 0.44 : 0.06;
  const ambientA = isDark ? 0.36 : 0.10;

  const make = (e: number) => {
    if (e === 0) return 'none';
    const y1 = Math.max(1, Math.round(e * 0.5));
    const b1 = Math.max(2, Math.round(e * 1.2));
    const y2 = Math.max(2, Math.round(e * 1.1));
    const b2 = Math.max(4, Math.round(e * 2.8));

    return `0px ${y1}px ${b1}px rgba(${rgb}, ${contactA}), 0px ${y2}px ${b2}px rgba(${rgb}, ${ambientA})`;
  };

  return Array.from({ length: 25 }, (_, i) => make(i)) as unknown as Shadows;
};

export const createAppTheme = (mode: ThemeMode) => {
  const isDark = mode === 'dark';

  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? 'rgb(201, 201, 201)' : '#3766AF',
      },
      secondary: {
        main: '#6BBC8C',
      },
      customPrimary:{
        main: '#3766AF',
      },
      customGradient: {
        gradient: 'linear-gradient(45deg, #6BBC8C 30%, #3766AF 90%)',
        killedGradient: 'linear-gradient(90deg, #d17b0f, #b32d00)',
      },
      customGrey: {
        main:  isDark ? grey[800] : grey[100],
        dark:  isDark ? grey[600] : grey[400],
        light: isDark ? grey[900] : grey[50],
        text:  isDark ? grey[300] : grey[700],
      },
      customBlue: {
        selected: isDark ? blue[600] : blue[50],
      },
      customSurface: {
        // Flat card header tone (no gradient) — reads as a clean modern card
        // header rather than a glossy titlebar.
        cardHeader: isDark ? '#23242f' : '#f4f6f9',
        sectionHeader: isDark
          ? 'linear-gradient(to right, #1a1a2e, #1e2133)'
          : 'linear-gradient(to right, #f1f5f9, #f8fafc)',
        cardContent: isDark ? '#1E1E1E' : '#FFFFFF',
        tray:        isDark ? grey[900]  : '#f8fafc',
        barTrack:    isDark ? grey[700]  : '#e2e8f0',
        footer:         isDark ? grey[900]  : '#f8f9fa',
        statCard:        isDark ? 'linear-gradient(135deg, #1a1a2e, #1e2133)' : 'linear-gradient(135deg, #f3f4f6, #e0e7ff)',
        statCardSuccess: isDark ? 'linear-gradient(135deg, #0d2b0d, #1a4a1a)' : 'linear-gradient(135deg, #d7f5d1, #a2d57a)',
        statCardFailure: isDark ? 'linear-gradient(90deg, #d17b0f, #b32d00)' : 'linear-gradient(90deg, #fcd9c8, #f87171)',
        statSuccess: isDark ? '#1a4a1a' : '#e6f4ea',
        statFailure: isDark ? '#b32d00' : '#fdecea',
        elevated:   isDark ? '#23232c' : '#ffffff',
        cardBorder: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.08)',
      },
      chart: {
        categorical: [...CHART_CATEGORICAL],
        diverging: isDark ? ['#f87171', '#3a3a44', '#4ade80'] : CHART_DIVERGING,
        neutral: isDark ? '#94a3b8' : CHART_NEUTRAL,
      },
      background: {
        default: isDark ? '#121212' : '#FFFFFF',
        paper:   isDark ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        // Light mode: soft dark slate instead of near-black, with a clearly
        // muted secondary — pure-black body text reads harsh on white.
        primary:   isDark ? '#E0E0E0' : '#2a3142',
        secondary: isDark ? '#B0BEC5' : '#697586',
      },
      // Soft divider so 1px borders read as a gentle edge, not a bright
      // hairline — the main offender behind the "white lines" in dark mode.
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    },
    shape: {
      // Rounder corners across the board for a softer, more modern feel.
      borderRadius: 6,
    },
    customShadows: {
      card: isDark
        ? '0 1px 2px rgba(0, 0, 0, 0.34), 0 2px 6px rgba(0, 0, 0, 0.26)'
        : '0 1px 2px rgba(16, 24, 40, 0.04), 0 2px 6px rgba(16, 24, 40, 0.05)',
      cardHover: isDark
        ? '0 2px 4px rgba(0, 0, 0, 0.4), 0 6px 16px rgba(0, 0, 0, 0.4)'
        : '0 2px 4px rgba(16, 24, 40, 0.06), 0 6px 16px rgba(16, 24, 40, 0.09)',
      popover: isDark
        ? '0 4px 16px rgba(0, 0, 0, 0.46)'
        : '0 4px 14px rgba(16, 24, 40, 0.10)',
    },
    shadows: buildShadows(isDark),
    typography: {
      fontFamily: '"All Round Gothic Bold", Arial, sans-serif',
      allVariants: {
        color: isDark ? '#FFFFFF' : '#2a3142',
      },
      // Compact-UI vocabulary — use these instead of inline sx for repeated patterns.
      cardTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        lineHeight: 1.4,
      },
      statValue: {
        fontSize: '0.85rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      // Compact body sizes. These are size-only tokens (no fontWeight) so they
      // rationalize the spread of inline sizes without ever changing weight —
      // set fontWeight via sx where emphasis is needed. bodyCompact (0.8rem) is
      // the app's workhorse body size; bodySm (0.75rem) is dense secondary text.
      bodyCompact: {
        fontSize: '0.8rem',
        lineHeight: 1.4,
      },
      bodySm: {
        fontSize: '0.75rem',
        lineHeight: 1.35,
      },
      statLabel: {
        fontSize: '0.7rem',
        fontWeight: 600,
      },
      captionLabel: {
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
      },
      mono: {
        fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            // Firefox
            scrollbarWidth: 'thin',
          },

          body: {
            // Firefox
            scrollbarColor: isDark
              ? `${grey[700]} ${grey[900]}`
              : `${grey[500]} ${grey[100]}`,
          },

          // Chrome / Edge / Safari
          '*::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: isDark ? grey[900] : grey[100],
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? grey[700] : grey[400],
            borderRadius: 10,
            border: `2px solid ${isDark ? grey[900] : grey[100]}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: isDark ? grey[600] : grey[500],
          },

          // The shared workflow-info tooltip carries its own themed surface, so
          // strip Vega-tooltip's default white container when it hosts ours.
          // Scoped via :has() so other (default) Vega tooltips are untouched.
          '#vg-tooltip-element:has(.wf-info-tip), .vg-tooltip:has(.wf-info-tip)': {
            background: 'transparent !important',
            border: 'none !important',
            boxShadow: 'none !important',
            padding: '0 !important',
            color: 'inherit',
          },
        },
      },
      // Global defaults that match our compact-UI patterns.
      // Anything you set explicitly on a component still wins.
      MuiButton: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiIconButton: {
        defaultProps: { size: 'small' },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minHeight: 40,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      // Compact form-control sizing. The app deliberately runs dense forms, so
      // make 0.8rem the default for inputs, selects, menu items and field
      // labels instead of repeating `fontSize: '0.8rem'` on every control.
      MuiInputBase: {
        styleOverrides: {
          input: { fontSize: '0.8rem' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: '0.8rem' },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: '0.8rem' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          // Default (rounded) Paper picks up the softer corner radius.
          rounded: { borderRadius: 12 },
          // Outlined papers should use the soft card border, not the default
          // bright divider — this removes a major source of dark-mode hairlines.
          outlined: {
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.07)'
              : 'rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '6px 10px',
            backgroundColor: isDark
              ? 'rgba(38, 38, 48, 0.96)'
              : 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(6px)',
            boxShadow: isDark
              ? '0 6px 20px rgba(0, 0, 0, 0.5)'
              : '0 6px 20px rgba(16, 24, 40, 0.18)',
          },
          arrow: {
            color: isDark ? 'rgba(38, 38, 48, 0.96)' : 'rgba(15, 23, 42, 0.92)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: 'background-color 160ms ease, color 160ms ease',
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme, { factor: 2 });
  return theme;
};

// Default light theme for files that import it statically
export default createAppTheme('light');
