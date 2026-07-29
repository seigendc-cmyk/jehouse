import React from 'react';
import { ProductCatalogue } from '../types';
import { ShoppingBag, Star, Mail, Phone, Globe, Check } from 'lucide-react';

interface CataloguePreviewProps {
  catalogue: ProductCatalogue;
}

export const CataloguePreview: React.FC<CataloguePreviewProps> = ({ catalogue }) => {
  const isLandscape = catalogue.orientation === 'landscape';

  const getAspectClass = () => {
    switch (catalogue.format) {
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

  const getGridCols = () => {
    switch (catalogue.layout) {
      case 'grid_2col':
        return 'grid-cols-1 sm:grid-cols-2';
      case 'hero_featured':
        return 'grid-cols-1';
      case 'grid_3col':
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`w-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between relative transition-all ${getAspectClass()}`}>
      
      {/* CATALOGUE COVER BANNER */}
      <div 
        className="p-6 sm:p-8 text-white relative bg-cover bg-center"
        style={{ 
          backgroundColor: catalogue.primaryColor,
          backgroundImage: catalogue.coverImageUrl ? `linear-gradient(to bottom, rgba(15,23,42,0.85), rgba(15,23,42,0.95)), url(${catalogue.coverImageUrl})` : undefined 
        }}
      >
        <div className="flex items-center justify-between gap-4 mb-4 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            {catalogue.logoUrl && (
              <img src={catalogue.logoUrl} alt="Logo" className="h-10 w-auto bg-white p-1 rounded border border-white/30" />
            )}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                {catalogue.companyName}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {catalogue.title}
              </h1>
            </div>
          </div>

          <div 
            className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white border border-amber-400/50 bg-amber-500/20"
          >
            Product Showcase
          </div>
        </div>

        {catalogue.subtitle && (
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {catalogue.subtitle}
          </p>
        )}
      </div>

      {/* PRODUCTS SHOWCASE GRID */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Featured Items ({catalogue.products.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Currency: {catalogue.currencySymbol}
          </span>
        </div>

        <div className={`grid gap-4 ${getGridCols()}`}>
          {catalogue.products.map(product => (
            <div 
              key={product.id}
              className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-slate-400 transition-all flex flex-col justify-between space-y-3 relative group"
            >
              {product.badge && (
                <div className="absolute top-2 right-2 z-10 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded shadow">
                  {product.badge}
                </div>
              )}

              {/* Product Image */}
              {product.imageUrl ? (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-200 border border-slate-200">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="w-full h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                  No Image
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">{product.category}</span>
                  {product.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>}
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {product.name}
                </h4>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications list if present */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-0.5 border-t border-slate-200 pt-1.5 text-[10px] text-slate-500">
                  {product.specifications.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price & Rating */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-sm text-slate-900">
                    {catalogue.currencySymbol}{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {catalogue.currencySymbol}{product.originalPrice}
                    </span>
                  )}
                </div>

                {product.rating && (
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{product.rating}.0</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* CATALOGUE FOOTER */}
      <div 
        className="p-4 sm:p-5 text-white text-xs space-y-2 border-t border-slate-200"
        style={{ backgroundColor: catalogue.primaryColor }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
          {catalogue.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{catalogue.phone}</span>
            </div>
          )}
          {catalogue.contactEmail && (
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{catalogue.contactEmail}</span>
            </div>
          )}
          {catalogue.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{catalogue.website}</span>
            </div>
          )}
        </div>

        {catalogue.termsNote && (
          <p className="text-[10px] text-slate-400 italic text-center border-t border-white/10 pt-1.5">
            {catalogue.termsNote}
          </p>
        )}
      </div>

    </div>
  );
};
