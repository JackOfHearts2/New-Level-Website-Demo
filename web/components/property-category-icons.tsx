import { Gem, Luggage, KeyRound, CalendarRange, PartyPopper, Tag, TrendingUp } from "lucide-react";

// Shape-differentiated per category (never color-coded) so each Properties
// landing page reads as visually distinct from the others — the same
// principle the static site's audience icons use (see root CLAUDE.md's
// locked design decisions).
export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Gem,
  Luggage,
  KeyRound,
  CalendarRange,
  PartyPopper,
  Tag,
  TrendingUp,
};
