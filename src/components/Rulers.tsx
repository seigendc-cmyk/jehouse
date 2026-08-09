import React from 'react';
import { TrimSize, PageOrientation } from '../types';
import { getTrimDimensionsInches } from '../lib/publishingGeometry';

export type RulerUnit = 'cm' | 'mm' | 'in';

interface RulerProps {
  trimSize?: TrimSize | string;
  pageOrientation?: PageOrientation;
  unit?: RulerUnit;
  onUnitChange?: (unit: RulerUnit) => void;
}

const getDimensionsInches = (trimSize: TrimSize | string = '6x9', orientation: PageOrientation | string = 'portrait') => {
  const { width: w, height: h } = getTrimDimensionsInches(trimSize);
  if (orientation === 'landscape') {
    return { width: h, height: w };
  }
  return { width: w, height: h };
};

export const HorizontalRuler: React.FC<RulerProps> = ({
  trimSize = '6x9',
  pageOrientation = 'portrait',
  unit = 'cm',
  onUnitChange,
}) => {
  const { width: totalInches } = getDimensionsInches(trimSize, pageOrientation);
  const pxPerInch = 80;
  const pxPerCm = pxPerInch / 2.54; // ~31.496 px/cm
  const pxPerMm = pxPerCm / 10;     // ~3.1496 px/mm

  const ticks = [];

  if (unit === 'in') {
    for (let i = 0; i <= totalInches * 4; i++) {
      const isMajor = i % 4 === 0;
      const isHalf = i % 2 === 0 && !isMajor;
      const val = i / 4;
      const posPx = val * pxPerInch;

      ticks.push(
        <div key={`h-in-${i}`} className="absolute top-0 flex flex-col items-center" style={{ left: `${posPx}px` }}>
          <div className={`w-px ${isMajor ? 'h-3.5 bg-gray-600 dark:bg-gray-300 font-bold' : isHalf ? 'h-2 bg-gray-400 dark:bg-gray-500' : 'h-1 bg-gray-300 dark:bg-gray-600'}`} />
          {isMajor && <span className="text-[9px] font-mono text-gray-600 dark:text-gray-300 -mt-0.5 select-none">{val}"</span>}
        </div>
      );
    }
  } else if (unit === 'cm') {
    const totalCm = totalInches * 2.54;
    for (let i = 0; i <= Math.ceil(totalCm * 10); i++) {
      const isMajor = i % 10 === 0;
      const isHalf = i % 5 === 0 && !isMajor;
      const valCm = i / 10;
      const posPx = valCm * pxPerCm;

      ticks.push(
        <div key={`h-cm-${i}`} className="absolute top-0 flex flex-col items-center" style={{ left: `${posPx}px` }}>
          <div className={`w-px ${isMajor ? 'h-3.5 bg-gray-600 dark:bg-gray-300 font-bold' : isHalf ? 'h-2 bg-gray-400 dark:bg-gray-500' : 'h-1 bg-gray-300 dark:bg-gray-600'}`} />
          {isMajor && <span className="text-[9px] font-mono text-gray-600 dark:text-gray-300 -mt-0.5 select-none font-bold">{valCm}</span>}
        </div>
      );
    }
  } else if (unit === 'mm') {
    const totalMm = totalInches * 25.4;
    for (let i = 0; i <= Math.ceil(totalMm); i++) {
      const isMajor = i % 10 === 0;
      const isHalf = i % 5 === 0 && !isMajor;
      const posPx = i * pxPerMm;

      ticks.push(
        <div key={`h-mm-${i}`} className="absolute top-0 flex flex-col items-center" style={{ left: `${posPx}px` }}>
          <div className={`w-px ${isMajor ? 'h-3.5 bg-orange-500 dark:bg-orange-400' : isHalf ? 'h-2 bg-gray-400 dark:bg-gray-500' : 'h-1 bg-gray-300 dark:bg-gray-600'}`} />
          {isMajor && <span className="text-[8px] font-mono text-gray-600 dark:text-gray-300 -mt-0.5 select-none">{i}</span>}
        </div>
      );
    }
  }

  const leftMarginPx = 0.75 * pxPerInch;

  return (
    <div className="w-full bg-[#E5E5E5] dark:bg-[#222222] border-b border-gray-300 dark:border-[#444] h-6 relative overflow-hidden select-none shadow-2xs rounded-t-lg flex items-center">
      {/* Unit Corner Badge Button */}
      {onUnitChange && (
        <button
          onClick={() => {
            const nextUnit: RulerUnit = unit === 'cm' ? 'mm' : unit === 'mm' ? 'in' : 'cm';
            onUnitChange(nextUnit);
          }}
          className="w-6 h-6 bg-[#333333] text-orange-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border-r border-gray-400 dark:border-[#555] hover:bg-[#444] cursor-pointer z-20"
          title={`Click to switch ruler unit (Current: ${unit.toUpperCase()})`}
        >
          {unit}
        </button>
      )}

      <div className="relative flex-1 h-full overflow-hidden">
        {/* Margin indicators */}
        <div
          className="absolute top-0 bottom-0 bg-[#FF6B00]/20 border-r border-[#FF6B00] z-10 pointer-events-none"
          style={{ width: `${leftMarginPx}px` }}
          title={`Left Margin: 0.75 in (${(0.75 * 2.54).toFixed(2)} cm)`}
        />
        <div
          className="absolute top-0 bottom-0 bg-[#FF6B00]/20 border-l border-[#FF6B00] right-0 z-10 pointer-events-none"
          style={{ width: `${leftMarginPx}px` }}
          title={`Right Margin: 0.75 in (${(0.75 * 2.54).toFixed(2)} cm)`}
        />

        <div className="relative w-full h-full">
          {ticks}
        </div>
      </div>
    </div>
  );
};

export const VerticalRuler: React.FC<RulerProps> = ({
  trimSize = '6x9',
  pageOrientation = 'portrait',
  unit = 'cm',
  onUnitChange,
}) => {
  const { height: totalInches } = getDimensionsInches(trimSize, pageOrientation);
  const pxPerInch = 80;
  const pxPerCm = pxPerInch / 2.54;
  const pxPerMm = pxPerCm / 10;

  const ticks = [];

  if (unit === 'in') {
    for (let i = 0; i <= totalInches * 4; i++) {
      const isMajor = i % 4 === 0;
      const isHalf = i % 2 === 0 && !isMajor;
      const val = i / 4;
      const posPx = val * pxPerInch;

      ticks.push(
        <div key={`v-in-${i}`} className="absolute left-0 flex items-center" style={{ top: `${posPx}px` }}>
          <div className={`h-px ${isMajor ? 'w-3.5 bg-gray-600 dark:bg-gray-300 font-bold' : isHalf ? 'w-2 bg-gray-400 dark:bg-gray-500' : 'w-1 bg-gray-300 dark:bg-gray-600'}`} />
          {isMajor && <span className="text-[9px] font-mono text-gray-600 dark:text-gray-300 ml-0.5 select-none">{val}</span>}
        </div>
      );
    }
  } else if (unit === 'cm') {
    const totalCm = totalInches * 2.54;
    for (let i = 0; i <= Math.ceil(totalCm * 10); i++) {
      const isMajor = i % 10 === 0;
      const isHalf = i % 5 === 0 && !isMajor;
      const valCm = i / 10;
      const posPx = valCm * pxPerCm;

      ticks.push(
        <div key={`v-cm-${i}`} className="absolute left-0 flex items-center" style={{ top: `${posPx}px` }}>
          <div className={`h-px ${isMajor ? 'w-3.5 bg-gray-600 dark:bg-gray-300 font-bold' : isHalf ? 'w-2 bg-gray-400 dark:bg-gray-500' : 'w-1 bg-gray-300 dark:bg-gray-600'}`} />
          {isMajor && <span className="text-[9px] font-mono text-gray-600 dark:text-gray-300 ml-0.5 select-none font-bold">{valCm}</span>}
        </div>
      );
    }
  } else if (unit === 'mm') {
    const totalMm = totalInches * 25.4;
    for (let i = 0; i <= Math.ceil(totalMm); i++) {
      const isMajor = i % 10 === 0;
      const isHalf = i % 5 === 0 && !isMajor;
      const posPx = i * pxPerMm;

      ticks.push(
        <div key={`v-mm-${i}`} className="absolute left-0 flex items-center" style={{ top: `${posPx}px` }}>
          <div className={`h-px ${isMajor ? 'w-3.5 bg-orange-500 dark:bg-orange-400' : isHalf ? 'w-2 bg-gray-400 dark:bg-gray-500' : 'w-1 bg-gray-300 dark:bg-gray-600'}`} />
          {isMajor && <span className="text-[8px] font-mono text-gray-600 dark:text-gray-300 ml-0.5 select-none">{i}</span>}
        </div>
      );
    }
  }

  const topMarginPx = 0.75 * pxPerInch;

  return (
    <div className="w-6 bg-[#E5E5E5] dark:bg-[#222222] border-r border-gray-300 dark:border-[#444] relative overflow-hidden select-none shrink-0 rounded-l-lg min-h-[85vh]">
      {/* Top Margin Indicator */}
      <div
        className="absolute left-0 right-0 top-0 bg-[#FF6B00]/20 border-b border-[#FF6B00] z-10 pointer-events-none"
        style={{ height: `${topMarginPx}px` }}
        title={`Top Margin: 0.75 in (${(0.75 * 2.54).toFixed(2)} cm)`}
      />

      <div className="relative h-full">
        {ticks}
      </div>
    </div>
  );
};
