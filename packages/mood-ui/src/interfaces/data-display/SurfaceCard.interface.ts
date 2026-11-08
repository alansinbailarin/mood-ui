import type { ImgHTMLAttributes } from "vue";
import type { ModoRadius, ModoSize } from "../../config/ModoConfig";

export type SurfaceCardVariant =
  | "outline"
  | "elevated"
  | "soft"
  | "outlined"
  | "filled";

export type SurfaceCardCanonicalVariant = "outline" | "elevated" | "soft";

/** `'default'` follows `size`; `'none'` drops every section's padding. */
export type SurfaceCardPadding = "default" | "none";

export type SurfaceCardSectionSurface = "none" | "subtle";

export type SurfaceCardSectionPadding = "default" | "none";

export type SurfaceCardSeparatorInset = "none" | "content";

export type SurfaceCardRootTag =
  | "article"
  | "div"
  | "section"
  | "button"
  | "a";

export type SurfaceCardHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type SurfaceCardFooterAlign = "end" | "between" | "start" | "stretch";

export interface SurfaceCard {
  /**
   * Surface look on the elevation ladder.
   * - `'outline'` (default): `--card` surface with a `--border` hairline (native Card `outlined`).
   * - `'elevated'`: `--card` surface, `--border` hairline and `--shadow-md` (lifts to `--shadow-lg` on hover).
   * - `'soft'`: `--muted` surface without outer border (native Card `filled`).
   * Accepts mood-ui aliases `'outlined'` -> `'outline'` and `'filled'` -> `'soft'`.
   */
  variant?: SurfaceCardVariant;
  /**
   * Spacing switch cascading to every section inside the card.
   * `'default'` uses the `size` scale; `'none'` zeroes padding and gap across all parts
   * (`SurfaceCard.Media` always bleeds edge-to-edge).
   */
  padding?: SurfaceCardPadding;
  /**
   * Size token (inherits from `ModoProvider` when omitted). Drives section padding,
   * gaps and the type scale (xsmall/small step the title down to `text-body`).
   */
  size?: ModoSize;
  /**
   * Corner radius token (inherits from `ModoProvider` when omitted).
   */
  radius?: ModoRadius;
  /**
   * Wraps all card content inside a concentric inner bordered container
   * (double-frame style) with a subtle perimeter bezel; its radius stays concentric with the root.
   * Defaults to `true`. Set `:framed="false"` for a single-border flat card.
   */
  framed?: boolean;
  /**
   * Root HTML element. Defaults to `'a'` when `href` is set, otherwise `'article'`.
   */
  as?: SurfaceCardRootTag;
  /**
   * Enables hover lift and tactile WAAPI press/spring feedback on the card surface.
   * Automatically `true` when `as="button"`, `as="a"`, or `href` is provided.
   */
  interactive?: boolean;
  /**
   * Disables interactive button or link cards (prevents click, navigation, and press motion).
   */
  disabled?: boolean;
  /**
   * Destination URL when `as="a"` (or auto-renders `<a>` when provided).
   */
  href?: string;
  target?: string;
  rel?: string;
  /**
   * Button `type` when `as="button"` (defaults to `'button'`).
   */
  type?: "button" | "submit" | "reset";
  /**
   * Accessible label when used as an interactive root control.
   */
  ariaLabel?: string;
}

export type SurfaceCardProps = SurfaceCard;

export interface SurfaceCardSectionProps {
  /**
   * Plane this section sits on. `'subtle'` applies a translucent `--muted` wash
   * (`--card` on the `soft` variant) for a grouped-settings look.
   */
  surface?: SurfaceCardSectionSurface;
  /**
   * Spacing override for this section only (`'none'` drops this section's padding).
   */
  padding?: SurfaceCardSectionPadding;
}

export interface SurfaceCardHeaderProps extends SurfaceCardSectionProps {
  /** Semantic wrapper tag. Defaults to `'div'`. */
  as?: "div" | "header" | "hgroup";
}

export interface SurfaceCardBodyProps extends SurfaceCardSectionProps {
  /** Semantic wrapper tag. Defaults to `'div'`. */
  as?: "div" | "section";
}

export interface SurfaceCardFooterProps extends SurfaceCardSectionProps {
  /** Semantic wrapper tag. Defaults to `'footer'`. */
  as?: "footer" | "div";
  /** Horizontal alignment of footer actions. Defaults to `'end'`. */
  align?: SurfaceCardFooterAlign;
}

export interface SurfaceCardSeparatorProps {
  /**
   * Where the hairline starts and ends.
   * - `'none'` (default): bleeds edge-to-edge.
   * - `'content'`: aligns with `--sc-padding` (iOS grouped-list separator).
   */
  inset?: SurfaceCardSeparatorInset;
}

export interface SurfaceCardMediaProps {
  /** Shortcut: renders a full-bleed `<img>` cover. Omit to render custom slot media only. */
  src?: string;
  /** Alt text for `src` image. Defaults to decorative `""` — set a descriptive string for informative images. */
  alt?: string;
  /** Reserved aspect ratio to prevent layout shift (e.g. `16 / 9`, `4 / 3`, `'1 / 1'`). Defaults to `16 / 9`. */
  ratio?: number | string;
  /** Extra native `<img>` attributes (`loading`, `decoding`, `fetchpriority`, `sizes`, `srcset`, etc.). */
  imgProps?: Omit<ImgHTMLAttributes, "src" | "alt">;
}

export interface SurfaceCardTitleProps {
  /** Semantic heading level so the card fits the page outline. Defaults to `'h3'`. */
  as?: SurfaceCardHeadingTag;
  /** Optional primary destination URL rendered as a native `<a>` inside the heading. */
  href?: string;
  target?: string;
  rel?: string;
  /**
   * Stretches the heading link's hit area across the entire `SurfaceCard` via `::after`
   * while keeping independent buttons/links in `Footer` or `Body` clickable above it.
   */
  stretchedLink?: boolean;
}

export interface SurfaceCardSubtitleProps {
  /** Element tag for the secondary line. Defaults to `'p'`. */
  as?: "p" | "span" | "div";
}
