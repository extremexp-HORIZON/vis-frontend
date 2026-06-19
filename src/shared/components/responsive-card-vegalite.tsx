import {
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  Typography,
  Divider,
  Tooltip,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CompactMenuItem from './compact-menu-item';
import { SectionHeader } from './responsive-card-table';
import { cardSurfaceSx, cardHeaderSx, menuPaperSx } from '../styles/card-surface';
import CloseIcon from '@mui/icons-material/Close';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VegaLite } from 'react-vega';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CodeIcon from '@mui/icons-material/Code';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Loader from './loader';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SortIcon from '@mui/icons-material/Sort';

interface ResponsiveCardVegaLiteProps {
  spec: Record<string, unknown>; // VegaLite specification
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number // Aspect ratio (width / height)
  [key: string]: unknown // Capture all other props
  controlPanel?: React.ReactNode
  infoMessage?: React.ReactElement
  showInfoMessage?: boolean
  isStatic?: boolean // If true, means the chart will be inside a static panel
  details?: string | null
  loading?: boolean
  title?: React.ReactNode;
  showSettings?: boolean;
  tooltip?: Parameters<typeof VegaLite>[0]['tooltip'];
  enableSorting?: boolean;
  initialSortDirection?: 'ascending' | 'descending' | 'none';
  signalListeners?: Parameters<typeof VegaLite>[0]['signalListeners'];
  /** Receives the live Vega view of the inline chart (for imperative signal updates). */
  onNewView?: Parameters<typeof VegaLite>[0]['onNewView'];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VLSpec = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (v: unknown): v is Record<string, any> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const applySizeToConcatChildren = (spec: VLSpec, w: number, h?: number): VLSpec => {
  const s: VLSpec = JSON.parse(JSON.stringify(spec));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (node: any) => {
    if (!isObject(node)) return;

    // If this node is a unit spec (has mark/encoding) set width/height here
    const isUnit =
      ('mark' in node || 'encoding' in node) &&
      !('vconcat' in node) &&
      !('hconcat' in node) &&
      !('concat' in node) &&
      !('repeat' in node);

    if (isUnit) {
      node.width = w;
      if (typeof h === 'number') node.height = h;
    }

    // Recurse into known containers
    const keys = ['vconcat', 'hconcat', 'concat', 'layer'];

    for (const k of keys) {
      if (Array.isArray(node[k])) node[k].forEach(visit);
    }

    // Some specs nest unit specs under spec (facet/repeat sometimes)
    if (isObject(node.spec)) visit(node.spec);
  };

  visit(s);

  return s;
};

const ResponsiveCardVegaLite: React.FC<ResponsiveCardVegaLiteProps> = ({
  spec,
  title,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 3000,
  maxHeight = 300,
  aspectRatio = 1,
  controlPanel,
  infoMessage,
  showInfoMessage,
  isStatic = true,
  details = null,
  loading = false,
  showSettings = true,
  tooltip = undefined,
  enableSorting = false,
  initialSortDirection = 'none',
  signalListeners,
  onNewView,
  ...otherProps
}) => {
  const [width, setWidth] = useState(minWidth);
  const [height, setHeight] = useState(minHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  // Add a new state for fullscreen menu
  const [fullscreenAnchorEl, setFullscreenAnchorEl] =
    useState<null | HTMLElement>(null);
  const fullscreenMenuOpen = Boolean(fullscreenAnchorEl);
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending' | 'none'>(
    initialSortDirection
  );

  // Function to get the sorted spec
  const getSortedSpec = useCallback(() => {
    if (!enableSorting || sortDirection === 'none') {
      return spec;
    }

    const sortedSpec = JSON.parse(JSON.stringify(spec));
    const encoding = sortedSpec.encoding || {};

    // Only for bar charts
    const markType = sortedSpec.mark?.type || sortedSpec.mark;

    if (markType !== 'bar' && markType?.type !== 'bar') {
      return sortedSpec;
    }

    // Check which axis should be sorted (the categorical one)
    const xIsCategorical = encoding.x?.type === 'nominal' || encoding.x?.type === 'ordinal';
    const yIsCategorical = encoding.y?.type === 'nominal' || encoding.y?.type === 'ordinal';

    if (xIsCategorical && encoding.x?.field && encoding.y?.field) {
      // Vertical bars: sort X (categories) by Y (values)
      sortedSpec.encoding.x.sort = {
        field: encoding.y.field,
        op: 'sum',
        order: sortDirection === 'ascending' ? 'ascending' : 'descending'
      };
    } else if (yIsCategorical && encoding.x?.field && encoding.y?.field) {
      // Horizontal bars: sort Y (categories) by X (values)
      sortedSpec.encoding.y.sort = {
        field: encoding.x.field,
        op: 'sum',
        order: sortDirection === 'ascending' ? 'ascending' : 'descending'
      };
    }

    return sortedSpec;
  }, [spec, sortDirection, enableSorting]);
  // Get the display spec with sorting applied
  const displaySpec = getSortedSpec();

  const isConcat =
    Boolean(displaySpec?.vconcat) ||
    Boolean(displaySpec?.hconcat) ||
    Boolean(displaySpec?.concat);

  // Function to update the chart dimensions based on the container's size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth =
        (containerRef.current.offsetWidth || window.innerWidth * 0.9);
      const containerHeight = isStatic
        ? containerRef.current.offsetHeight || window.innerHeight * 0.5
        : 0;
      // Adjust to fit exactly within the container with no overflow
      const newWidth = Math.max(minWidth, Math.min(containerWidth, maxWidth));

      const newHeight = isStatic
        ? Math.max(
          minHeight,
          Math.min(newWidth / aspectRatio, maxHeight, containerHeight),
        )
        : Math.max(minHeight, Math.min(newWidth / aspectRatio, maxHeight));

      setWidth(newWidth);
      setHeight(newHeight);
    }
  }, [minWidth, maxWidth, minHeight, maxHeight, aspectRatio, isStatic, isConcat]);

  // Function to handle sort change
  const handleSortChange = (direction: 'ascending' | 'descending' | 'none') => {
    setSortDirection(direction);
    handleMenuClose();
  };

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [updateSize]);

  useEffect(() => {
    const container = containerRef.current ?? document.body;

    const pickLiveTip = (): HTMLDivElement | null => {
      const tips = document.querySelectorAll<HTMLDivElement>('.vega-tooltip, .vg-tooltip');

      return tips.length ? tips[tips.length - 1] : null;
    };

    const isTipVisible = (el: HTMLElement) => {
      const cs = getComputedStyle(el);

      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
      const r = el.getBoundingClientRect();

      return r.width > 0 && r.height > 0;
    };

    // track pointer (for initial pinned position)
    let lastMouseX = 0, lastMouseY = 0;
    const onPointerMove = (e: PointerEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      schedule(); // reclamp live tooltip
    };

    // clamp the live (hover) tooltip to viewport
    const clampLive = () => {
      const el = pickLiveTip();

      if (!el) return;

      el.style.position = 'fixed';
      el.style.transform = 'none';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.zIndex = '2000';
      el.style.maxWidth = 'min(90vw, 800px)';
      el.style.maxHeight = '80vh';
      el.style.overflowX = 'auto';
      el.style.overflowY = 'auto';

      // keep words intact
      el.style.whiteSpace = 'normal';
      el.style.wordBreak = 'normal';
      el.style.overflowWrap = 'normal';

      const pad = 8;
      const rect = el.getBoundingClientRect();
      let left = rect.left;
      let top = rect.top;

      if (left < pad) left = pad;
      else if (left + rect.width > window.innerWidth - pad)
        left = Math.max(pad, window.innerWidth - pad - rect.width);

      if (top < pad) top = pad;
      else if (top + rect.height > window.innerHeight - pad)
        top = Math.max(pad, window.innerHeight - pad - rect.height);

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };

    // pinned panel
    const PINNED_CLASS = 'vega-tooltip-pinned';
    let pinnedWrap: HTMLDivElement | null = null;

    const removeAllPinned = () => {
      document
        .querySelectorAll<HTMLDivElement>(`.${PINNED_CLASS}`)
        .forEach(el => el.remove());
    };

    const closePinned = () => {
      removeAllPinned();
      pinnedWrap = null;
    };

    // suppress re-pin briefly after close
    let suppressUntil = 0;
    const suppressFor = (ms: number) => { suppressUntil = performance.now() + ms; };

    const pinNow = () => {
      const src = pickLiveTip();

      if (!src) return;
      removeAllPinned();

      const wrap = document.createElement('div');

      pinnedWrap = wrap;
      wrap.className = PINNED_CLASS;
      wrap.setAttribute('role', 'dialog');
      wrap.style.position = 'fixed';

      const pad = 10;
      const maxW = Math.min(window.innerWidth - 2 * pad, 800);
      const initLeft = Math.min(Math.max(pad, lastMouseX + 12), window.innerWidth - pad - maxW);
      const initTop  = Math.min(Math.max(pad, lastMouseY + 12), window.innerHeight - pad - 200);

      wrap.style.left = `${initLeft}px`;
      wrap.style.top = `${initTop}px`;
      wrap.style.zIndex = '2500';
      wrap.style.maxWidth = 'min(90vw, 800px)';
      wrap.style.maxHeight = '80vh';
      wrap.style.overflow = 'auto';
      // Theme-aware surface (matches the hover tooltip / app theme).
      wrap.style.background = theme.palette.background.paper;
      wrap.style.color = theme.palette.text.primary;
      wrap.style.border = `1px solid ${theme.palette.customSurface.cardBorder}`;
      wrap.style.borderRadius = '8px';
      wrap.style.boxShadow = theme.customShadows.popover;

      // header + close (X only)
      const head = document.createElement('div');

      head.style.display = 'flex';
      head.style.alignItems = 'center';
      head.style.justifyContent = 'flex-end';
      head.style.gap = '8px';
      head.style.padding = '4px 6px';
      head.style.position = 'sticky';
      head.style.top = '0';
      head.style.background = theme.palette.background.paper;
      head.style.zIndex = '1';

      const btn = document.createElement('button');

      btn.textContent = '×';
      btn.title = 'Close';
      btn.style.cursor = 'pointer';
      btn.style.border = 'none';
      btn.style.background = 'transparent';
      btn.style.color = theme.palette.text.secondary;
      btn.style.fontSize = '18px';
      btn.style.lineHeight = '1';
      btn.style.padding = '2px 6px';

      head.appendChild(btn);

      // body (copy HTML; scrollable, no mid-word breaks)
      const body = document.createElement('div');

      body.style.padding = '0 10px 10px';
      body.style.whiteSpace = 'normal';
      body.style.wordBreak = 'normal';
      body.style.overflowWrap = 'normal';
      body.style.color = theme.palette.text.primary;
      body.innerHTML = src.innerHTML;

      // The copied markup is our self-surfaced workflow-info box; strip its
      // surface so the pinned panel itself provides the single themed frame.
      const innerBox = body.querySelector<HTMLElement>('.wf-info-tip');

      if (innerBox) {
        innerBox.style.background = 'transparent';
        innerBox.style.border = 'none';
        innerBox.style.boxShadow = 'none';
        innerBox.style.padding = '0';
        innerBox.style.maxWidth = 'none';
      }

      wrap.appendChild(head);
      wrap.appendChild(body);
      document.body.appendChild(wrap);

      // close only via X (and suppress re-pin)
      const onCloseClick = (e: MouseEvent) => {
        e.stopPropagation(); // don't bubble to window click
        e.preventDefault();
        closePinned();
        suppressFor(200);
      };

      btn.addEventListener('click', onCloseClick);

      // drag to reposition (ignore clicks on the close button)
      let dragging = false, dx = 0, dy = 0;
      const onDown = (e: MouseEvent) => {
        const inClose = (e.target as HTMLElement | null)?.closest('button') === btn;

        if (inClose) return;
        dragging = true;
        const r = wrap.getBoundingClientRect();

        dx = e.clientX - r.left;
        dy = e.clientY - r.top;
        e.preventDefault();
        e.stopPropagation();
      };
      const onMove = (e: MouseEvent) => {
        if (!dragging) return;
        const r = wrap.getBoundingClientRect();
        const w = r.width, h = r.height;
        let x = e.clientX - dx;
        let y = e.clientY - dy;
        const pad = 10;

        x = Math.max(pad, Math.min(window.innerWidth - pad - w, x));
        y = Math.max(pad, Math.min(window.innerHeight - pad - h, y));
        wrap.style.left = `${x}px`;
        wrap.style.top = `${y}px`;
      };
      const onUp = () => { dragging = false; };

      head.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);

      // cleanup when node is removed
      const obs = new MutationObserver(() => {
        if (!document.body.contains(wrap)) {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          obs.disconnect();
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });
    };

    // Pin ONLY if:
    //  - click is inside the chart container
    //  - a live tooltip exists and is visible at click time
    const onWindowClick = (e: MouseEvent) => {
      if (performance.now() < suppressUntil) return;
      if (pinnedWrap && pinnedWrap.contains(e.target as Node)) return; // ignore clicks in pinned
      if (!container.contains(e.target as Node)) return;

      const tip = pickLiveTip();

      if (!tip || !isTipVisible(tip)) return;

      pinNow();
    };

    // rAF throttle for clamp
    let raf: number | null = null;
    const schedule = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        clampLive();
      });
    };

    // re-clamp when Vega mutates tooltip DOM
    const rootObserver = new MutationObserver(schedule);

    rootObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // Disabled for now
    window.addEventListener('click', onWindowClick); // bubble phase

    schedule();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('click', onWindowClick);
      rootObserver.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);

      closePinned();

    };
  }, [theme]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // New function to handle chart download
  const handleDownloadChart = () => {
    if (containerRef.current) {
      // Find the canvas element inside the container
      const canvas = containerRef.current.querySelector('canvas');

      if (canvas) {
        // Create a temporary link element
        const link = document.createElement('a');

        link.download = `${title || 'chart'}_${new Date().toISOString()
          .split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    handleMenuClose();
  };

  // Enhanced function to handle full-screen mode
  const handleFullScreen = () => {
    setFullscreenOpen(true);
    handleMenuClose();
  };

  const handleCloseFullscreen = () => {
    setFullscreenOpen(false);
  };

  // When fullscreen dialog opens, resize the chart to fit
  useEffect(() => {
    if (fullscreenOpen) {
      // Short delay to ensure the dialog is rendered before measuring
      const timer = setTimeout(() => updateSize(), 100);

      return () => clearTimeout(timer);
    }
  }, [fullscreenOpen, updateSize]);

  // Replaced view data function with JSON download function
  const handleDownloadData = () => {
    if (spec?.data) {
      // Extract data from spec
      let dataToExport;

      if (
        typeof spec.data === 'object' &&
        spec.data !== null &&
        'values' in spec.data &&
        Array.isArray((spec.data as { values: unknown }).values)
      ) {
        dataToExport = (spec.data as { values: unknown }).values;
      } else if (
        typeof spec.data === 'object' &&
        spec.data !== null &&
        'name' in spec.data &&
        typeof (spec.data as { name: unknown }).name === 'string' &&
        otherProps.data &&
        typeof otherProps.data === 'object' &&
        otherProps.data !== null
      ) {
        const name = (spec.data as { name: string }).name;
        const dataMap = otherProps.data as Record<string, unknown>;

        if (name in dataMap) {
          dataToExport = dataMap[name];
        } else {
          dataToExport = spec.data;
        }
      } else {
        dataToExport = spec.data;
      }
      // Convert data to JSON string
      const jsonData = JSON.stringify(dataToExport, null, 2);

      // Create blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${title || 'chart-data'}_${new Date().toISOString()
        .split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  const handleFullscreenMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setFullscreenAnchorEl(event.currentTarget);
  };

  const handleFullscreenMenuClose = () => {
    setFullscreenAnchorEl(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deepMerge = (target: any, source: any): any => {
    if (!isObject(target) || !isObject(source)) return source;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any = { ...target };
    for (const key of Object.keys(source)) {
      const sv = source[key];
      const tv = target[key];
      out[key] = isObject(tv) && isObject(sv) ? deepMerge(tv, sv) : sv;
    }
    return out;
  };

  const sizedSpec = useMemo(() => {
    if (!isConcat) return displaySpec;

    // For concat: give children the measured width so they don't default to 200px.
    // If you *also* want consistent heights per child, pass a height too.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return applySizeToConcatChildren(displaySpec as any, width /* , height */);
  }, [displaySpec, isConcat, width]);

  const fullscreenWidth = fullScreen ? Math.floor(window.innerWidth * 0.94) : Math.floor(window.innerWidth * 0.87);
  const fullscreenHeight = isConcat ? 200 : Math.floor(window.innerHeight * 0.7);

  const fullscreenSpec = useMemo(() => {
    if (!isConcat) return displaySpec;

    // For concat: size children explicitly so they don't default to 200px
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return applySizeToConcatChildren(displaySpec as any, fullscreenWidth, fullscreenHeight);
  }, [displaySpec, isConcat, fullscreenWidth, fullscreenHeight]);

  const vegaBg = theme.palette.customSurface.cardContent;
  const textColor = theme.palette.text.primary;
  const dividerColor = theme.palette.divider;

  const vegaThemePatch = useMemo(() => {
    return {
      background: vegaBg,
      config: {
        view: { fill: vegaBg, stroke: null },
        axis: {
          labelColor: textColor,
          titleColor: textColor,
          gridColor: dividerColor,
          domainColor: dividerColor,
          tickColor: dividerColor,
        },
        legend: {
          labelColor: textColor,
          titleColor: textColor,
        },
        title: { color: textColor },
      },
    };
  }, [vegaBg, textColor, dividerColor]);

  const themedSizedSpec = useMemo(() => {
    const base = {
      ...sizedSpec,
      autosize: isConcat
        ? { type: 'fit-x', contains: 'padding', resize: true }
        : { type: 'fit', contains: 'padding', resize: true },
      ...(isConcat ? {} : { width, height }),
    };

    // Make sure our theme wins (deep merge so config.axis etc merges nicely)
    return deepMerge(base, vegaThemePatch);
  }, [sizedSpec, isConcat, width, height, vegaThemePatch]);

  const themedFullscreenSpec = useMemo(() => {
    const base = {
      ...fullscreenSpec,
      autosize: isConcat
        ? { type: 'fit-x', contains: 'padding', resize: true }
        : { type: 'fit', contains: 'padding', resize: true },
      ...(isConcat ? {} : { width: fullscreenWidth, height: fullscreenHeight }),
    };

    return deepMerge(base, vegaThemePatch);
  }, [fullscreenSpec, isConcat, fullscreenWidth, fullscreenHeight, vegaThemePatch]);
  return (
    <>
      <style>
        {`
          .vega-tooltip,
          .vg-tooltip {
            z-index: 2000 !important;
          }
        `}
      </style>
      <Card
        elevation={0}
        sx={[
          cardSurfaceSx(),
          {
            maxWidth: maxWidth,
            mx: 'auto',
            mb: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        ]}
      >
        <Box
          sx={[
            cardHeaderSx(),
            {
              justifyContent: 'space-between',
              flexShrink: 0,
              minWidth: 0,
            },
          ]}
        >
          {/* Title (unchanged, just wrapped for truncation) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 1,
              }}
            >
              {title}
            </Typography>
            {details && (
              <Tooltip title={details}>
                <InfoOutlinedIcon
                  sx={{ fontSize: 14, color: 'text.secondary', cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: 2 }}>
            {showSettings && (
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleMenuClick}
                  size="small"
                  sx={{
                    position: 'relative',
                    '& svg': {
                      zIndex: 1,
                      position: 'relative',
                    },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 0,
                    sx: [
                      menuPaperSx(),
                      { '& .MuiMenu-list': { padding: 0 } },
                    ],
                  }}
                  MenuListProps={{
                    sx: {
                      padding: 0,
                    },
                  }}
                >
                  <SectionHeader
                    icon={<TuneRoundedIcon fontSize="small" />}
                    title="Chart Options"
                  />
                  <Box
                    sx={{
                      overflowY: 'auto',
                      maxHeight: 320,
                    }}
                  >
                    {controlPanel && (
                      <>
                        <Box sx={{ p: 1.25 }}>{controlPanel}</Box>
                        <Divider sx={{ opacity: 0.6 }} />
                      </>
                    )}
                    <Box sx={{ py: 0.5 }}>
                      {enableSorting && (
                        <CompactMenuItem
                          onClick={() => handleSortChange(sortDirection === 'none' ? 'descending' :
                            sortDirection === 'descending' ? 'ascending' : 'none')}
                          selected={sortDirection !== 'none'}
                          icon={
                            sortDirection === 'descending' ? (
                              <ArrowDownwardIcon fontSize="small" />
                            ) : sortDirection === 'ascending' ? (
                              <ArrowUpwardIcon fontSize="small" />
                            ) : (
                              <SortIcon fontSize="small" />
                            )
                          }
                          primary={
                            sortDirection === 'descending' ? 'Sort: Descending' :
                              sortDirection === 'ascending' ? 'Sort: Ascending' :
                                'Sort: None'
                          }
                          secondary={
                            sortDirection === 'descending' ? 'Highest first' :
                              sortDirection === 'ascending' ? 'Lowest first' :
                                'Click to sort'
                          }
                        />
                      )}
                      <CompactMenuItem
                        onClick={handleDownloadChart}
                        icon={<DownloadIcon fontSize="small" />}
                        primary="Download as PNG"
                        secondary="Save chart as image"
                      />
                      <CompactMenuItem
                        onClick={handleDownloadData}
                        icon={<CodeIcon fontSize="small" />}
                        primary="Download Data as JSON"
                        secondary="Export chart's underlying data"
                      />
                    </Box>
                  </Box>
                </Menu>
              </>
            )}
            <Tooltip title="Fullscreen">
              <IconButton
                aria-label="fullscreen"
                onClick={handleFullScreen}
                size="small"
                sx={{
                  mr: 0.5,
                  '& svg': {
                    position: 'relative',
                    zIndex: 1,
                  },
                }}
              >
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <CardContent
          sx={{
            bgcolor: 'customSurface.cardContent',
            py: 2,
            px: 3,
            '&:last-child': {
              paddingBottom: 3,
            },
            borderRadius: '0 0 8px 8px',
            display: 'flex',
            flexGrow: 1, // Allow content to grow
            overflow: 'auto', // Only make the content scrollable
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isConcat && !showInfoMessage && !loading ? 'flex-start' : 'center',
          }}
        >
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              height: isConcat && !showInfoMessage && !loading ? 'auto' : '100%',
              display: isConcat && !showInfoMessage && !loading ? 'block' : 'flex',
              alignItems: 'center',
              justifyContent: isStatic ? 'center' : 'flex-start',
            }}
          >
            {showInfoMessage ? (
              <Box sx={{ width: width, height: height }}>{infoMessage}</Box>
            ) : loading ? (
              <Loader/>
            ) : (
              <VegaLite
                spec={{
                  ...themedSizedSpec,
                  autosize: isConcat
                    ? { type: 'fit-x', contains: 'padding', resize: true }
                    : { type: 'fit', contains: 'padding', resize: true },
                  ...(isConcat ? {} : { width, height }),
                }}
                {...otherProps}
                tooltip={tooltip}
                signalListeners={signalListeners}
                onNewView={onNewView}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={fullscreenOpen}
        onClose={handleCloseFullscreen}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            width: fullScreen ? '100%' : '90vw',
            height: fullScreen ? '100%' : '90vh',
            maxWidth: 'unset',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            boxShadow: theme => theme.customShadows.popover,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {title}
            </Typography>
            {details && (
              <Tooltip title={details}>
                <InfoOutlinedIcon
                  sx={{ fontSize: 16, color: 'text.secondary', cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {(controlPanel || (enableSorting && showSettings)) && (
              <>
                <IconButton
                  aria-label="settings"
                  onClick={handleFullscreenMenuClick}
                  size="small"
                  sx={{
                    mr: 1,
                    '& svg': {
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={fullscreenAnchorEl}
                  open={fullscreenMenuOpen}
                  onClose={handleFullscreenMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 0,
                    sx: [
                      menuPaperSx(),
                      { '& .MuiMenu-list': { padding: 0 } },
                    ],
                  }}
                  MenuListProps={{
                    sx: {
                      padding: 0,
                    },
                  }}
                >
                  <SectionHeader
                    icon={<TuneRoundedIcon fontSize="small" />}
                    title="Chart Options"
                  />
                  <Box
                    sx={{
                      overflowY: 'auto',
                      maxHeight: 320,
                    }}
                  >
                    {controlPanel && (
                      <>
                        <Box sx={{ p: 1.25 }}>{controlPanel}</Box>
                        <Divider sx={{ opacity: 0.6 }} />
                      </>
                    )}

                    <Box sx={{ py: 0.5 }}>
                      {enableSorting && (
                        <CompactMenuItem
                          onClick={() => {
                            handleSortChange(sortDirection === 'none' ? 'descending' :
                              sortDirection === 'descending' ? 'ascending' : 'none');
                            handleFullscreenMenuClose();
                          }}
                          selected={sortDirection !== 'none'}
                          icon={
                            sortDirection === 'descending' ? (
                              <ArrowDownwardIcon fontSize="small" />
                            ) : sortDirection === 'ascending' ? (
                              <ArrowUpwardIcon fontSize="small" />
                            ) : (
                              <SortIcon fontSize="small" />
                            )
                          }
                          primary={
                            sortDirection === 'descending' ? 'Sort: Descending' :
                              sortDirection === 'ascending' ? 'Sort: Ascending' :
                                'Sort: None'
                          }
                          secondary={
                            sortDirection === 'descending' ? 'Highest first' :
                              sortDirection === 'ascending' ? 'Lowest first' :
                                'Click to sort'
                          }
                        />
                      )}
                    </Box>
                  </Box>
                </Menu>
              </>
            )}
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseFullscreen}
              aria-label="close"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: 1.5,
            height: isConcat && !showInfoMessage && !loading ? 'auto' : '100%',
            display: isConcat && !showInfoMessage && !loading ? 'block' : 'flex',
            alignItems: 'center',
            justifyContent: isConcat && !showInfoMessage && !loading ? 'flex-start' : 'center',
            bgcolor: 'background.paper',
          }}
        >
          {!showInfoMessage ? (
            loading ? (
              <Loader/>
            ) : (
              <VegaLite
                spec={{
                  ...themedFullscreenSpec,
                  autosize: isConcat
                    ? { type: 'fit-x', contains: 'padding', resize: true }
                    : { type: 'fit', contains: 'padding', resize: true },

                  ...(isConcat ? {} : { width: fullscreenWidth, height: fullscreenHeight }),
                }}
                {...otherProps}
                tooltip={tooltip}
              />
            )
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {infoMessage}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2,
            py: 1.5,
            borderTop: theme => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            onClick={handleDownloadChart}
            startIcon={<DownloadIcon fontSize="small" />}
            variant="outlined"
            color="primary"
          >
            Download as PNG
          </Button>
          <Button
            onClick={handleCloseFullscreen}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResponsiveCardVegaLite;
