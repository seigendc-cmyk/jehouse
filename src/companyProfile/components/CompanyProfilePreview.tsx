import React from 'react';
import { CompanyProfile, CompanySection } from '../types';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  CheckCircle2, 
  Star, 
  ArrowUpRight, 
  Quote, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CompanyProfilePreviewProps {
  profile: CompanyProfile;
}

export const CompanyProfilePreview: React.FC<CompanyProfilePreviewProps> = ({ profile }) => {
  const primaryColor = profile.primaryColor || '#2563eb';
  const secondaryColor = profile.secondaryColor || '#0f172a';

  // Helper for font class
  const getFontFamilyClass = () => {
    switch (profile.fontPairing) {
      case 'corporate':
        return 'font-serif';
      case 'elegant':
        return 'font-serif';
      case 'creative':
        return 'font-sans tracking-tight';
      case 'modern':
      default:
        return 'font-sans';
    }
  };

  return (
    <div className={`company-profile-document w-full bg-white text-zinc-900 ${getFontFamilyClass()} shadow-2xl rounded-xl overflow-hidden border border-zinc-200`}>
      
      {/* 1. HERO & BRANDING HEADER BANNER */}
      <div 
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: secondaryColor }}
      >
        {/* Background Image / Overlay */}
        {profile.heroImageUrl ? (
          <div className="absolute inset-0 z-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${profile.heroImageUrl})` }} />
        ) : (
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4" style={{ borderColor: primaryColor }}>
          <div className="space-y-3 max-w-2xl">
            {/* Logo + Tagline */}
            <div className="flex items-center gap-3">
              {profile.logoUrl ? (
                <img 
                  src={profile.logoUrl} 
                  alt={profile.name} 
                  className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-xl border-2 border-white/20 shadow-md bg-white p-1"
                />
              ) : (
                <div 
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-md border border-white/20"
                  style={{ backgroundColor: primaryColor }}
                >
                  {profile.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-300 font-bold px-2 py-0.5 rounded bg-white/10 backdrop-blur border border-white/10">
                  {profile.industry || 'Company Profile'}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mt-1">
                  {profile.name}
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-200 font-medium italic leading-relaxed">
              "{profile.tagline}"
            </p>

            {/* Quick Meta Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-2 font-mono">
              {profile.foundedYear && (
                <span className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Founded: <strong className="text-white">{profile.foundedYear}</strong>
                </span>
              )}
              {profile.employees && (
                <span className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  Team: <strong className="text-white">{profile.employees}</strong>
                </span>
              )}
              {profile.headquarters && (
                <span className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  HQ: <strong className="text-white">{profile.headquarters}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Contact Badge Box */}
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs text-zinc-200 space-y-2 w-full md:w-auto shrink-0 font-sans">
            <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 border-b border-white/10 pb-1 flex items-center justify-between">
              <span>Corporate Contact</span>
              <Building2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </div>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white text-zinc-300 transition-colors">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[180px]">{profile.website.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-white text-zinc-300 transition-colors">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[180px]">{profile.email}</span>
              </a>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT SECTIONS */}
      <div className="p-6 sm:p-10 space-y-10">
        {profile.sections.map((section, idx) => (
          <SectionRenderer 
            key={section.id || idx} 
            section={section} 
            primaryColor={primaryColor} 
            secondaryColor={secondaryColor}
          />
        ))}
      </div>

      {/* 3. FOOTER */}
      {profile.footerNote && (
        <div className="p-4 sm:p-6 bg-zinc-100 border-t border-zinc-200 text-center text-xs text-zinc-500 font-medium">
          {profile.footerNote}
        </div>
      )}
    </div>
  );
};

// Internal component to render each section dynamically
const SectionRenderer: React.FC<{
  section: CompanySection;
  primaryColor: string;
  secondaryColor: string;
}> = ({ section, primaryColor, secondaryColor }) => {

  // Process text paragraphs and markdown bold text
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n').filter(Boolean);
    return lines.map((line, lIdx) => {
      // Check for bullet list
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={lIdx} className="text-zinc-700 text-xs sm:text-sm leading-relaxed my-1">
            {formatBoldText(itemText)}
          </li>
        );
      }

      return (
        <p key={lIdx} className="text-zinc-700 text-xs sm:text-sm leading-relaxed my-2">
          {formatBoldText(line)}
        </p>
      );
    });
  };

  const formatBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-bold text-zinc-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`section-block transition-all ${
      section.isHighlighted 
        ? 'p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100/90 border-2 shadow-sm' 
        : ''
    }`} style={{ borderColor: section.isHighlighted ? primaryColor : 'transparent' }}>
      
      {/* Section Title Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {section.title}
          </h2>
        </div>
        {section.subtitle && (
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            {section.subtitle}
          </p>
        )}
        <div className="h-0.5 w-16 mt-2 rounded" style={{ backgroundColor: primaryColor }} />
      </div>

      {/* Main Content & Optional Image Layout */}
      <div className={`grid grid-cols-1 ${
        section.imageUrl && section.imagePosition !== 'full' ? 'md:grid-cols-12 gap-6 items-center' : ''
      }`}>
        
        {/* Left Image Option */}
        {section.imageUrl && section.imagePosition === 'left' && (
          <div className="md:col-span-5 space-y-1">
            <img 
              src={section.imageUrl} 
              alt={section.title} 
              className="w-full h-56 sm:h-64 object-cover rounded-xl shadow-md border border-zinc-200"
            />
            {section.imageCaption && (
              <p className="text-[11px] text-zinc-500 italic text-center font-mono">
                {section.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Text Content */}
        <div className={
          section.imageUrl && (section.imagePosition === 'left' || section.imagePosition === 'right') 
            ? 'md:col-span-7 space-y-2' 
            : 'space-y-2'
        }>
          {renderFormattedText(section.content)}
        </div>

        {/* Right Image Option */}
        {section.imageUrl && section.imagePosition === 'right' && (
          <div className="md:col-span-5 space-y-1 mt-4 md:mt-0">
            <img 
              src={section.imageUrl} 
              alt={section.title} 
              className="w-full h-56 sm:h-64 object-cover rounded-xl shadow-md border border-zinc-200"
            />
            {section.imageCaption && (
              <p className="text-[11px] text-zinc-500 italic text-center font-mono">
                {section.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Full Width Image Banner Option */}
        {section.imageUrl && (section.imagePosition === 'full' || section.imagePosition === 'top') && (
          <div className="col-span-full my-4 space-y-1">
            <img 
              src={section.imageUrl} 
              alt={section.title} 
              className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-md border border-zinc-200"
            />
            {section.imageCaption && (
              <p className="text-[11px] text-zinc-500 italic text-center font-mono">
                {section.imageCaption}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 1. HIGHLIGHT STATS GRID */}
      {section.stats && section.stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {section.stats.map((st) => (
            <div 
              key={st.id} 
              className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition-all"
            >
              <div className="text-xl sm:text-3xl font-black tracking-tight" style={{ color: primaryColor }}>
                {st.value}
              </div>
              <div className="text-xs font-bold text-zinc-800 mt-1 uppercase tracking-wider">
                {st.label}
              </div>
              {st.subtext && (
                <div className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  {st.subtext}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. SERVICES & OFFERINGS GRID */}
      {section.services && section.services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {section.services.map((srv) => (
            <div 
              key={srv.id}
              className="p-4 sm:p-5 rounded-xl border border-zinc-200 bg-white hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {srv.imageUrl && (
                  <img src={srv.imageUrl} alt={srv.title} className="w-full h-32 object-cover rounded-lg mb-3 border border-zinc-100" />
                )}
                {srv.badge && (
                  <span 
                    className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    {srv.badge}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mt-1.5">
                  {srv.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LEADERSHIP TEAM GRID */}
      {section.members && section.members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {section.members.map((m) => (
            <div 
              key={m.id}
              className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-start gap-3.5 hover:bg-white hover:shadow-md transition-all"
            >
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-zinc-300 shrink-0" />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {m.name.substring(0, 2)}
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                  {m.name}
                </h4>
                <p className="text-[11px] font-semibold text-blue-600 truncate">
                  {m.title}
                </p>
                <p className="text-[11px] text-zinc-500 leading-normal line-clamp-3">
                  {m.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. TESTIMONIALS & REVIEWS */}
      {section.testimonials && section.testimonials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {section.testimonials.map((t) => (
            <div 
              key={t.id}
              className="p-4 sm:p-5 rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 shadow-xs relative space-y-3"
            >
              <Quote className="w-6 h-6 text-zinc-300 absolute top-3 right-3 opacity-50" />
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200/80">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.clientName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {t.clientName.substring(0, 2)}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-zinc-900">{t.clientName}</div>
                  <div className="text-[10px] font-medium text-zinc-500">{t.clientCompany}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
