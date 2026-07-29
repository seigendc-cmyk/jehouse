export type DocumentFormat = 'a4' | 'us_letter' | 'square_1to1' | 'social_banner';
export type PageOrientation = 'portrait' | 'landscape';

// FLYER TYPES
export type FlyerTheme = 'modern_corporate' | 'vibrant_promo' | 'dark_luxury' | 'minimal_tech';

export interface FlyerFeatureItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  badge?: string;
}

export interface BusinessFlyer {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  format: DocumentFormat;
  orientation: PageOrientation;
  theme: FlyerTheme;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  heroImageUrl?: string;
  promoBadge?: string; // e.g. "50% OFF THIS WEEK"
  discountHeadline?: string;
  bodyText: string;
  features: FlyerFeatureItem[];
  callToAction: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  footerNote?: string;
}

// CATALOGUE TYPES
export type CatalogueLayout = 'grid_3col' | 'grid_2col' | 'hero_featured' | 'magazine_spread';

export interface CatalogueProduct {
  id: string;
  name: string;
  category: string;
  sku?: string;
  price: string;
  originalPrice?: string;
  description: string;
  imageUrl?: string;
  badge?: string; // e.g. "BEST SELLER", "NEW"
  rating?: number;
  specifications?: string[];
}

export interface ProductCatalogue {
  id: string;
  title: string;
  subtitle: string;
  companyName: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  layout: CatalogueLayout;
  format: DocumentFormat;
  orientation: PageOrientation;
  currencySymbol: string;
  products: CatalogueProduct[];
  contactEmail: string;
  website: string;
  phone: string;
  termsNote?: string;
}

// INVITATION TYPES
export type InvitationType = 'marriage' | 'birthday' | 'gala' | 'anniversary' | 'graduation' | 'baby_shower';
export type InvitationTheme = 'royal_gold' | 'floral_elegance' | 'modern_chic' | 'black_tie' | 'playful_party';

export interface InvitationCard {
  id: string;
  type: InvitationType;
  theme: InvitationTheme;
  orientation: PageOrientation;
  format: DocumentFormat;
  title: string; // e.g. "Save the Date", "You Are Cordially Invited"
  celebrants: string; // e.g. "Sophia & Alexander" or "Michael's 30th Birthday"
  tagline?: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  address: string;
  dressCode?: string;
  rsvpDeadline?: string;
  rsvpContact?: string;
  heroImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontStyle: 'serif_gold' | 'script_romance' | 'sans_modern' | 'playful';
  message: string;
  giftRegistryNote?: string;
}
