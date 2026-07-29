import React from 'react';
import { InvitationCard } from '../types';
import { Calendar, Clock, MapPin, Heart, Sparkles, User, Gift } from 'lucide-react';

interface InvitationPreviewProps {
  invitation: InvitationCard;
}

export const InvitationPreview: React.FC<InvitationPreviewProps> = ({ invitation }) => {
  const isLandscape = invitation.orientation === 'landscape';

  const getAspectClass = () => {
    switch (invitation.format) {
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

  const getFontFamily = () => {
    switch (invitation.fontStyle) {
      case 'serif_gold':
        return 'font-serif';
      case 'script_romance':
        return 'font-serif italic';
      case 'playful':
        return 'font-sans font-black';
      case 'sans_modern':
      default:
        return 'font-sans tracking-wide';
    }
  };

  return (
    <div 
      className={`w-full text-slate-900 rounded-xl shadow-2xl overflow-hidden border-8 flex flex-col justify-between relative transition-all p-6 sm:p-10 ${getAspectClass()} ${getFontFamily()}`}
      style={{ 
        borderColor: invitation.primaryColor,
        backgroundColor: '#fdfbf7' // warm ivory canvas
      }}
    >
      
      {/* ELEGANT ORNATE BORDER PATTERN */}
      <div 
        className="absolute inset-2 border-2 border-dashed rounded-lg pointer-events-none opacity-40"
        style={{ borderColor: invitation.primaryColor }}
      />

      {/* TOP HEADER / TITLE */}
      <div className="text-center space-y-2 relative z-10">
        <div className="flex justify-center text-amber-600 mb-1">
          {invitation.type === 'marriage' ? (
            <Heart className="w-8 h-8 fill-amber-500 text-amber-600 animate-pulse" />
          ) : (
            <Sparkles className="w-8 h-8 text-amber-600" />
          )}
        </div>

        <span 
          className="text-xs sm:text-sm font-black uppercase tracking-widest block"
          style={{ color: invitation.primaryColor }}
        >
          {invitation.title}
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {invitation.celebrants}
        </h1>

        {invitation.tagline && (
          <p className="text-xs sm:text-sm text-slate-600 italic font-medium">
            {invitation.tagline}
          </p>
        )}
      </div>

      {/* HERO IMAGE OR MESSAGE */}
      <div className="my-4 text-center space-y-4 relative z-10">
        {invitation.heroImageUrl && (
          <div className="max-w-md mx-auto h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-200">
            <img src={invitation.heroImageUrl} alt="Celebration Hero" className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
          "{invitation.message}"
        </p>
      </div>

      {/* EVENT DETAILS GRID */}
      <div 
        className="p-4 sm:p-6 rounded-2xl border bg-white/80 backdrop-blur-sm shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10"
        style={{ borderColor: invitation.primaryColor + '40' }}
      >
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date</span>
            <p className="font-bold text-xs sm:text-sm text-slate-900">{invitation.eventDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Time</span>
            <p className="font-bold text-xs sm:text-sm text-slate-900">{invitation.eventTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:col-span-2 border-t border-slate-100 pt-3">
          <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Venue Location</span>
            <p className="font-bold text-xs sm:text-sm text-slate-900">{invitation.venueName}</p>
            <p className="text-xs text-slate-600">{invitation.address}</p>
          </div>
        </div>
      </div>

      {/* RSVP & DRESS CODE FOOTER */}
      <div className="text-center space-y-2 pt-4 relative z-10 text-xs text-slate-700">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-slate-800">
          {invitation.dressCode && (
            <span className="bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
              Dress Code: <strong>{invitation.dressCode}</strong>
            </span>
          )}
          {invitation.rsvpDeadline && (
            <span className="bg-slate-200/80 px-3 py-1 rounded-full">
              RSVP Deadline: <strong>{invitation.rsvpDeadline}</strong>
            </span>
          )}
        </div>

        {invitation.rsvpContact && (
          <p className="text-[11px] text-slate-600">
            Please respond to: <strong className="text-slate-900">{invitation.rsvpContact}</strong>
          </p>
        )}

        {invitation.giftRegistryNote && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 italic pt-1">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>{invitation.giftRegistryNote}</span>
          </div>
        )}
      </div>

    </div>
  );
};
