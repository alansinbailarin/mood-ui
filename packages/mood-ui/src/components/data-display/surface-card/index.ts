import SurfaceCardRoot from "./SurfaceCard.vue";
import SurfaceCardMedia from "./SurfaceCardMedia.vue";
import SurfaceCardHeader from "./SurfaceCardHeader.vue";
import SurfaceCardTitle from "./SurfaceCardTitle.vue";
import SurfaceCardSubtitle from "./SurfaceCardSubtitle.vue";
import SurfaceCardBody from "./SurfaceCardBody.vue";
import SurfaceCardFooter from "./SurfaceCardFooter.vue";
import SurfaceCardSeparator from "./SurfaceCardSeparator.vue";

export type SurfaceCardCompound = typeof SurfaceCardRoot & {
  Media: typeof SurfaceCardMedia;
  Header: typeof SurfaceCardHeader;
  Title: typeof SurfaceCardTitle;
  Subtitle: typeof SurfaceCardSubtitle;
  Body: typeof SurfaceCardBody;
  Footer: typeof SurfaceCardFooter;
  Separator: typeof SurfaceCardSeparator;
};

export const SurfaceCard: SurfaceCardCompound = Object.assign(SurfaceCardRoot, {
  Media: SurfaceCardMedia,
  Header: SurfaceCardHeader,
  Title: SurfaceCardTitle,
  Subtitle: SurfaceCardSubtitle,
  Body: SurfaceCardBody,
  Footer: SurfaceCardFooter,
  Separator: SurfaceCardSeparator,
});

export {
  SurfaceCardMedia,
  SurfaceCardHeader,
  SurfaceCardTitle,
  SurfaceCardSubtitle,
  SurfaceCardBody,
  SurfaceCardFooter,
  SurfaceCardSeparator,
};

export default SurfaceCard;
