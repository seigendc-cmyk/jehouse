import React from 'react';
import { ResolvedDropCap } from '../lib/dropCaps';

export const DropCapText:React.FC<{text:string;resolved:ResolvedDropCap}>=({text,resolved})=>{
  if(!resolved.enabled||!resolved.opening)return <>{text}</>;
  const {prefix,cap,remainder}=resolved.opening;
  const style:React.CSSProperties=resolved.style==='raised'
    ?{fontSize:`${resolved.lines}em`,lineHeight:1,verticalAlign:`${resolved.baselineAdjustmentPt}pt`,marginRight:`${resolved.spacingRightPt}pt`}
    :{float:'left',fontSize:`${resolved.lines*1.05}em`,lineHeight:.82,marginTop:`${resolved.spacingTopPt}pt`,marginRight:`${resolved.spacingRightPt}pt`,marginLeft:resolved.style==='in-margin'?`-${resolved.lines*.45}em`:undefined};
  return <>{prefix}<span className={`drop-cap drop-cap-${resolved.style}`} style={{...style,fontFamily:resolved.fontFamily,fontWeight:resolved.fontWeight,fontStyle:resolved.fontStyle,color:resolved.colour}}>{cap}</span>{remainder}</>;
};
