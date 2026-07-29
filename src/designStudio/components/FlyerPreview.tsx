import React from 'react';
import { BusinessFlyer } from '../types';
import { Mail, Phone, Globe, MapPin, CheckCircle, Tag, Sparkles } from 'lucide-react';

interface FlyerPreviewProps {
  flyer: BusinessFlyer;
}

export const FlyerPreview: React.FC<FlyerPreviewProps> = ({ flyer }) => {
  // Determine aspect ratio class based on format & orientation
  const isLandscape = flyer.orientation === 'landscape';

  const getAspectClass = () => {
    switch (flyer.format) {
      case 'square_1to1':
        return 'aspect-square';
      case 'social_banner':
        return isLandscape ? 'aspect-[16/9]' : 'aspect-[9/16]';
      case 'us_letter':
        return isLandscape ? 'aspect-[11/8.5]' : 'aspect-[8.5/11]';
      case 'a4':
      default:
        return isLandscape ? 'aspect-[1.414/1]' : 'aspect-[1/1.414]';
    }
  };

  return (
    <div className={`w-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between relative transition-all ${getAspectClass()}`}>
      
      {/* BACKGROUND DECORATIVE ACCENTS */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: flyer.primaryColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: flyer.secondaryColor }}
      />

      {/* FLYER TOP BANNER / HEADER */}
      <div 
        className="p-6 sm:p-8 text-white relative flex flex-col justify-between"
        style={{ backgroundColor: flyer.secondaryColor }}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          {flyer.logoUrl ? (
            <img src={flyer.logoUrl} alt="Logo" className="h-12 w-auto object-contain bg-white/10 p-1.5 rounded-lg border border-white/20" />
          ) : (
            <div className="flex items-center gap-2 font-black text-lg tracking-wider">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>BRAND LOGO</span>
            </div>
          )}

          {flyer.promoBadge && (
            <div 
              className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5 animate-pulse"
              style={{ backgroundColor: flyer.primaryColor }}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{flyer.promoBadge}</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase leading-tight mb-2">
            {flyer.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            {flyer.subtitle}
          </p>
        </div>
      </div>

      {/* FLYER BODY CONTENT SECTION */}
      <div className={`p-6 sm:p-8 flex-1 grid gap-6 ${isLandscape ? 'grid-cols-2 items-center' : 'grid-cols-1'}`}>
        
        {/* LEFT COLUMN: HERO IMAGE & DISCOUNT HEADLINE */}
        <div className="space-y-4">
          {flyer.heroImageUrl ? (
            <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200 group">
              <img 
                src={flyer.heroImageUrl} 
                alt="Flyer Hero" 
                className="w-full h-44 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {flyer.tagline && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs font-bold">
                  {flyer.tagline}
                </div>
              )}
            </div>
          ) : flyer.tagline ? (
            <div 
              className="p-4 rounded-xl text-white font-bold text-center shadow-md text-sm sm:text-base"
              style={{ backgroundColor: flyer.primaryColor }}
            >
              "{flyer.tagline}"
            </div>
          ) : null}

          {flyer.discountHeadline && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 font-extrabold text-xs sm:text-sm text-center shadow-sm">
              ✨ {flyer.discountHeadline}
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {flyer.bodyText}
          </p>
        </div>

        {/* RIGHT COLUMN: FEATURES LIST */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1.5">
            Key Features & Highlights
          </h3>

          <div className="space-y-3">
            {flyer.features.map(feat => (
              <div key={feat.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                <div 
                  className="p-1.5 rounded-lg text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: flyer.primaryColor }}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{feat.title}</h4>
                    {feat.badge && (
                      <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FLYER CALL TO ACTION & FOOTER CONTACT BAR */}
      <div className="border-t border-slate-200 bg-slate-900 text-white p-5 sm:p-6 space-y-4">
        
        {/* CTA BOX */}
        <div 
          className="p-3.5 rounded-xl text-center text-white font-extrabold text-xs sm:text-sm shadow-lg tracking-wide uppercase"
          style={{ backgroundColor: flyer.primaryColor }}
        >
          {flyer.callToAction}
        </div>

        {/* CONTACT INFORMATION ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-300 border-t border-slate-800 pt-3">
          {flyer.contactPhone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{flyer.contactPhone}</span>
            </div>
          )}
          {flyer.contactEmail && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{flyer.contactEmail}</span>
            </div>
          )}
          {flyer.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{flyer.website}</span>
            </div>
          )}
          {flyer.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{flyer.address}</span>
            </div>
          )}
        </div>

        {flyer.footerNote && (
          <p className="text-[10px] text-center text-slate-400 italic">
            {flyer.footerNote}
          </p>
        )}
      </div>

    </div>
  );
};
