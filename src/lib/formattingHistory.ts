import { BookProject } from '../types';

export type HistoryScope='block-formatting'|'project-typography'|'palette'|'scene-break'|'structure';
export interface FormattingHistoryEntry {
 id:string;label:string;timestamp:number;scope:HistoryScope;
 before:BookProject;after:BookProject;activeBlockBefore?:string;activeBlockAfter?:string;mergeKey?:string;
}
export const FORMATTING_HISTORY_LIMIT=50;
export class FormattingHistoryController {
 private past:FormattingHistoryEntry[]=[]; private future:FormattingHistoryEntry[]=[];
 constructor(private readonly limit=FORMATTING_HISTORY_LIMIT,private readonly mergeWindowMs=750){}
 execute(input:Omit<FormattingHistoryEntry,'id'|'timestamp'>,now=Date.now()):boolean{
  if(JSON.stringify(input.before)===JSON.stringify(input.after))return false;
  const prior=this.past.at(-1);
  const entry:FormattingHistoryEntry={...input,id:`history-${now}-${crypto.randomUUID()}`,timestamp:now};
  if(prior&&input.mergeKey&&prior.mergeKey===input.mergeKey&&now-prior.timestamp<=this.mergeWindowMs){
   this.past[this.past.length-1]={...entry,id:prior.id,before:prior.before,activeBlockBefore:prior.activeBlockBefore};
  }else{this.past.push(entry);if(this.past.length>this.limit)this.past.shift();}
  this.future=[];return true;
 }
 undo(){const entry=this.past.pop();if(!entry)return null;this.future.push(entry);return {project:structuredClone(entry.before),entry,activeBlockId:entry.activeBlockBefore};}
 redo(){const entry=this.future.pop();if(!entry)return null;this.past.push(entry);return {project:structuredClone(entry.after),entry,activeBlockId:entry.activeBlockAfter};}
 clear(){this.past=[];this.future=[];}
 get canUndo(){return this.past.length>0;} get canRedo(){return this.future.length>0;}
 get undoLabel(){return this.past.at(-1)?.label;} get redoLabel(){return this.future.at(-1)?.label;}
 get size(){return {past:this.past.length,future:this.future.length};}
}
