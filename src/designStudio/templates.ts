import { BusinessFlyer, ProductCatalogue, InvitationCard } from './types';

// PRESET BUSINESS FLYERS
export const PRESET_FLYERS: BusinessFlyer[] = [
  {
    id: 'flyer-tech-summit',
    title: 'GLOBAL TECH & AI SUMMIT 2026',
    subtitle: 'The Premier Enterprise AI & Cloud Innovation Conference',
    tagline: 'Connect. Innovate. Transform.',
    format: 'a4',
    orientation: 'portrait',
    theme: 'vibrant_promo',
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    promoBadge: 'EARLY BIRD - 30% OFF TICKETS',
    discountHeadline: 'Limited Seats Available for Keynote Sessions',
    heroImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    bodyText: 'Join 2,500+ technology leaders, developers, and founders for two days of visionary keynotes, hands-on masterclasses, and executive networking.',
    features: [
      { id: 'f1', title: '50+ Visionary Speakers', description: 'Hear from industry CTOs and AI researchers from top tech hubs.', badge: 'Keynotes' },
      { id: 'f2', title: 'Hands-On Workshops', description: 'Deep-dive sessions on agentic LLMs, micro-infrastructure & security.', badge: 'Technical' },
      { id: 'f3', title: 'Executive Networking Lounge', description: 'Exclusive VIP roundtables and investor matching sessions.', badge: 'VIP Access' }
    ],
    callToAction: 'Reserve Your Seat Today — Register at summit2026.example.com',
    contactEmail: 'tickets@summit2026.example.com',
    contactPhone: '+1 (800) 555-0199',
    website: 'https://summit2026.example.com',
    address: 'Metropolitan Convention Center, New York, NY',
    footerNote: 'Sponsored by Global Cloud Alliance. All rights reserved 2026.'
  },
  {
    id: 'flyer-grand-opening',
    title: 'GRAND OPENING - LUMINA LUXURY BISTRO',
    subtitle: 'Fine Dining, Artisanal Cocktails & Live Jazz Nights',
    tagline: 'An Unforgettable Culinary Journey',
    format: 'us_letter',
    orientation: 'landscape',
    theme: 'dark_luxury',
    primaryColor: '#d97706',
    secondaryColor: '#18181b',
    promoBadge: 'COMPLIMENTARY WELCOME DRINK',
    discountHeadline: 'Special 4-Course Tasting Menu on Opening Weekend',
    heroImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    bodyText: 'Lumina brings Michelin-inspired organic Mediterranean cuisine to downtown. Experience curated wines and handcrafted desserts in an elegant contemporary setting.',
    features: [
      { id: 'f11', title: 'Award-Winning Chef', description: 'Executive Chef Marco Rossi presents seasonal organic flavors.', badge: 'Gastronomy' },
      { id: 'f22', title: 'Craft Mixology', description: 'Handcrafted signature cocktails infused with house-made botanicals.', badge: 'Bar & Lounge' },
      { id: 'f33', title: 'Live Acoustic Jazz', description: 'Nightly performances by renowned international jazz artists.', badge: 'Atmosphere' }
    ],
    callToAction: 'Book Your Table Now on OpenTable or Call Us Directly',
    contactEmail: 'reservations@luminabistro.example.com',
    contactPhone: '+1 (212) 555-0144',
    website: 'https://luminabistro.example.com',
    address: '450 Grand Avenue, Downtown Arts District',
    footerNote: 'Valet Parking Available. Dress Code: Smart Casual.'
  }
];

// PRESET CATALOGUES
export const PRESET_CATALOGUES: ProductCatalogue[] = [
  {
    id: 'cat-luxe-home',
    title: 'LUXE HOME & INTERIORS',
    subtitle: '2026 Spring / Summer Collection Catalogue',
    companyName: 'Luxe Living Design Studio',
    primaryColor: '#0f172a',
    secondaryColor: '#ca8a04',
    layout: 'grid_3col',
    format: 'a4',
    orientation: 'portrait',
    currencySymbol: '$',
    coverImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    products: [
      {
        id: 'p1',
        name: 'Aura Minimalist Velvet Lounge Sofa',
        category: 'Living Room',
        sku: 'SOFA-LX-01',
        price: '1,490',
        originalPrice: '1,850',
        description: 'Ergonomic solid oak frame upholstered in stain-resistant Italian velvet.',
        badge: 'BEST SELLER',
        rating: 5,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
        specifications: ['Dimension: 210 x 95 cm', 'Material: Oak & Velvet', 'Colors: Emerald, Midnight Blue']
      },
      {
        id: 'p2',
        name: 'Nordic Floating Solid Walnut Dining Table',
        category: 'Dining Room',
        sku: 'TBL-ND-02',
        price: '1,120',
        originalPrice: '1,350',
        description: 'Handcrafted solid walnut wood table with matte protective finish.',
        badge: 'NEW ARRIVAL',
        rating: 5,
        imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=500&auto=format&fit=crop&q=80',
        specifications: ['Seats: 6-8 Persons', 'Solid American Walnut', 'Dimensions: 180 x 90 cm']
      },
      {
        id: 'p3',
        name: 'Sculptural Brass Floor Pendant Lamp',
        category: 'Lighting',
        sku: 'LMP-BR-03',
        price: '380',
        description: 'Dimmable warm LED ambient floor light in brushed antique brass finish.',
        badge: 'LIMITED EDITION',
        rating: 4,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
        specifications: ['Height: 165 cm', 'LED 2700K Warm Light', 'Touch Dimmable Base']
      }
    ],
    contactEmail: 'orders@luxeliving.example.com',
    website: 'https://luxeliving.example.com',
    phone: '+1 (800) 456-7890',
    termsNote: 'All products include a 3-year structural warranty & complimentary white-glove delivery.'
  }
];

// PRESET INVITATIONS
export const PRESET_INVITATIONS: InvitationCard[] = [
  {
    id: 'inv-marriage-royal',
    type: 'marriage',
    theme: 'royal_gold',
    orientation: 'portrait',
    format: 'a4',
    title: 'Together with Their Families',
    celebrants: 'Sophia Bennett & Alexander Wright',
    tagline: 'Cordially invite you to celebrate their wedding union',
    eventDate: 'Saturday, September 19, 2026',
    eventTime: 'At Four o’clock in the afternoon',
    venueName: 'The St. Regis Grand Ballroom',
    address: '701 Fifth Avenue, Manhattan, New York',
    dressCode: 'Black Tie Formal',
    rsvpDeadline: 'August 15, 2026',
    rsvpContact: 'rsvp@sophiaandalex.example.com or +1 (212) 555-0188',
    heroImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    primaryColor: '#b45309',
    secondaryColor: '#0f172a',
    fontStyle: 'serif_gold',
    message: 'As we begin our journey together, your presence on our special day would bring us immense joy and happiness.',
    giftRegistryNote: 'Your love and presence is the greatest gift. Registries are available at Bloomingdale’s.'
  },
  {
    id: 'inv-birthday-30th',
    type: 'birthday',
    theme: 'vibrant_promo' as any,
    orientation: 'landscape',
    format: 'us_letter',
    title: 'CHAPTER 30 — THE CELEBRATION',
    celebrants: 'Marcus Sterling’s 30th Birthday Bash',
    tagline: 'Food, Cocktails & Rooftop Beats',
    eventDate: 'Friday, October 23, 2026',
    eventTime: '8:00 PM till late',
    venueName: 'Skyline Glass Lounge & Terrace',
    address: '88 West Street, Rooftop Floor, City Center',
    dressCode: 'Cocktail Attire & Chic Outfits',
    rsvpDeadline: 'October 10, 2026',
    rsvpContact: 'Marcus at +1 (415) 555-0192',
    heroImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    primaryColor: '#ec4899',
    secondaryColor: '#09090b',
    fontStyle: 'playful',
    message: 'Join us as Marcus turns 30! Get ready for a night filled with signature cocktails, live DJ tunes, and unforgettable memories.',
    giftRegistryNote: 'No physical gifts necessary — just bring your best energy and dancing shoes!'
  }
];
