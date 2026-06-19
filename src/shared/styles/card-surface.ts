import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

/**
 * Shared visual language for card / panel surfaces.
 *
 * Use these helpers instead of hand-rolling `border: 1px solid divider` +
 * `boxShadow: 'none'` recipes. They give every card the same radius, a soft
 * elevation that reads on dark backgrounds, an optional accent stripe, and a
 * gentle hover-lift — the patterns the observability / cluster cards already
 * use, lifted here so the rest of the app matches.
 */

/** Consistent corner radius for all cards (px). Matches the MuiPaper override. */
export const CARD_RADIUS = 12;

/** Consistent header band height for all cards (px). */
export const CARD_HEADER_HEIGHT = 44;

export interface CardSurfaceOptions {
  /** Accent color painted as a thin stripe along the top edge. */
  accent?: string;
  /** Lift + brighten the shadow on hover (use for clickable cards). */
  interactive?: boolean;
}

/**
 * Container styling for a card/panel. Spread or pass directly to `sx`:
 *   <Paper sx={cardSurfaceSx({ accent: theme.palette.primary.main })} />
 */
export const cardSurfaceSx =
  ({ accent, interactive = false }: CardSurfaceOptions = {}) =>
  (theme: Theme): SystemStyleObject<Theme> => ({
    position: 'relative',
    borderRadius: `${CARD_RADIUS}px`,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.customSurface.cardBorder}`,
    boxShadow: theme.customShadows.card,
    overflow: 'hidden',
    transition: theme.transitions.create(
      ['box-shadow', 'transform', 'border-color'],
      { duration: 200 },
    ),
    ...(accent
      ? {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: accent,
            zIndex: 1,
          },
        }
      : {}),
    ...(interactive
      ? {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme.customShadows.cardHover,
            transform: 'translateY(-2px)',
            borderColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.14)'
                : 'rgba(15, 23, 42, 0.14)',
          },
        }
      : {}),
  });

/**
 * Header band styling for a card. Gradient background, consistent height, and
 * a soft bottom edge instead of a bright hairline.
 */
export const cardHeaderSx =
  () =>
  (theme: Theme): SystemStyleObject<Theme> => ({
    minHeight: CARD_HEADER_HEIGHT,
    px: 1.5,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    background: theme.palette.customSurface.cardHeader,
    borderBottom: `1px solid ${theme.palette.divider}`,
  });

export interface MenuPaperOptions {
  /** Fixed paper width in px (default 240). */
  width?: number;
  /** Max paper height in px before scrolling (default 380). */
  maxHeight?: number;
}

/**
 * Floating-surface styling for `<Menu>` / `<Popover>` Paper. Replaces the
 * `{ width: 240, maxHeight: 380, borderRadius: 2, popover shadow, cardBorder }`
 * block that was hand-copied across every settings menu — so every menu and
 * popover reads with the same radius, elevation and soft border.
 *
 *   <Menu PaperProps={{ elevation: 0, sx: menuPaperSx() }} />
 *   <Popover slotProps={{ paper: { elevation: 0, sx: menuPaperSx({ width: 380 }) } }} />
 */
export const menuPaperSx =
  ({ width = 240, maxHeight = 380 }: MenuPaperOptions = {}) =>
  (theme: Theme): SystemStyleObject<Theme> => ({
    width,
    maxHeight,
    overflow: 'hidden',
    borderRadius: `${CARD_RADIUS}px`,
    mt: 0.5,
    boxShadow: theme.customShadows.popover,
    border: `1px solid ${theme.palette.customSurface.cardBorder}`,
  });
