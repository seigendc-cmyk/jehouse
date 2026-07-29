export type CompanyLayoutStyle = 'modern_minimal' | 'executive_luxe' | 'tech_grid' | 'creative_bold';

export type FontPairingStyle = 'modern' | 'corporate' | 'elegant' | 'creative';

export type SectionType = 
  | 'overview' 
  | 'mission_vision' 
  | 'values' 
  | 'services' 
  | 'leadership' 
  | 'milestones' 
  | 'highlights_stats' 
  | 'portfolio' 
  | 'testimonials' 
  | 'contact' 
  | 'custom';

export interface CompanyServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  badge?: string;
  imageUrl?: string;
}

export interface CompanyStatItem {
  id: string;
  label: string;
  value: string;
  subtext?: string;
}

export interface CompanyTeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  linkedin?: string;
  email?: string;
}

export interface CompanyMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface CompanyPortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  client?: string;
}

export interface CompanyTestimonial {
  id: string;
  clientName: string;
  clientCompany: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
}

export interface CompanySection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content: string; // Formatted content text
  imageUrl?: string;
  imageCaption?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'full';
  isHighlighted?: boolean;
  services?: CompanyServiceItem[];
  stats?: CompanyStatItem[];
  members?: CompanyTeamMember[];
  milestones?: CompanyMilestone[];
  portfolio?: CompanyPortfolioItem[];
  testimonials?: CompanyTestimonial[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  heroImageUrl?: string;
  foundedYear: string;
  headquarters: string;
  website: string;
  email: string;
  phone: string;
  industry: string;
  employees: string;
  primaryColor: string; // Hex color
  secondaryColor: string;
  fontPairing: FontPairingStyle;
  layoutStyle: CompanyLayoutStyle;
  sections: CompanySection[];
  footerNote?: string;
}
