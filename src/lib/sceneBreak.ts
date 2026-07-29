import { ContentBlock, SceneBreakSettings } from '../types';

export const DEFAULT_SCENE_BREAK: Readonly<SceneBreakSettings> = Object.freeze({
  style:'asterisms', alignment:'centre', spacingBeforePt:18, spacingAfterPt:18, keepWithNext:true
});
export const sanitizeSceneBreakText=(value:string):string=>{
  const plain=value.replace(/[<>&]/g,'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,24);
  return plain;
};
export const createSceneBreakBlock=():ContentBlock=>({
  id:`b-${Date.now()}-${crypto.randomUUID()}`,type:'scene-break',text:'',sceneBreak:{...DEFAULT_SCENE_BREAK}
});
export const resolveSceneBreak=(block:Pick<ContentBlock,'sceneBreak'>):SceneBreakSettings=>{
  const s={...DEFAULT_SCENE_BREAK,...block.sceneBreak};
  return {...s,customText:s.style==='custom'?sanitizeSceneBreakText(s.customText??''):undefined,spacingBeforePt:Math.min(72,Math.max(0,s.spacingBeforePt)),spacingAfterPt:Math.min(72,Math.max(0,s.spacingAfterPt))};
};
export const sceneBreakMark=(settings:SceneBreakSettings):string=>{
  if(settings.style==='asterisms')return '* * *';
  if(settings.style==='dots')return '• • •';
  if(settings.style==='ornament')return '❦';
  if(settings.style==='custom')return sanitizeSceneBreakText(settings.customText??'')||'* * *';
  return '';
};
export const sceneBreakTextAlign=(alignment:SceneBreakSettings['alignment'])=>alignment==='centre'?'center':alignment;
export const sceneBreakHtml=(block:Pick<ContentBlock,'sceneBreak'>):string=>{
 const s=resolveSceneBreak(block),align=sceneBreakTextAlign(s.alignment),keep=s.keepWithNext?'break-after:avoid;page-break-after:avoid;':'';
 if(s.style==='rule')return `<div class="scene-break scene-break-rule" role="separator" style="margin:${s.spacingBeforePt}pt 0 ${s.spacingAfterPt}pt;border-top:1px solid currentColor;${keep}"></div>`;
 return `<div class="scene-break" role="separator" aria-label="Scene break" style="text-align:${align};margin:${s.spacingBeforePt}pt 0 ${s.spacingAfterPt}pt;${keep}">${s.style==='whitespace'?'':sceneBreakMark(s)}</div>`;
};
