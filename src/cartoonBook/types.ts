export type ArtStyle = 
  | 'disney_3d' 
  | 'classic_2d' 
  | 'anime_manga' 
  | 'comic_book_pop' 
  | 'chibi_cute' 
  | 'watercolor_storybook';

export type TargetAudience = 
  | 'kids_3_5' 
  | 'kids_6_8' 
  | 'teens' 
  | 'all_ages';

export interface CartoonCharacter {
  id: string;
  name: string;
  speciesRole: string; // e.g. "Space Puppy", "Wise Owl", "Cyber Ninja"
  visualDescription: string;
  personality: string;
  colorPalette: string;
  avatarUrl?: string;
}

export type BubbleType = 'speech' | 'thought' | 'shout' | 'whisper';

export interface SpeechBubble {
  id: string;
  speakerName: string;
  text: string;
  bubbleType: BubbleType;
  position: { x: number; y: number }; // percentage 0-100 relative to panel
}

export type CameraAngle = 'wide' | 'close_up' | 'medium' | 'low_angle' | 'action_dynamic';

export interface CartoonPanel {
  id: string;
  panelNumber: number;
  visualPrompt: string;
  illustrationUrl: string;
  speechBubbles: SpeechBubble[];
  sfxText?: string; // e.g. "BOOM!", "WHOOSH!", "ZIP!"
  sfxColor?: string;
  cameraAngle: CameraAngle;
  narrativeCaption?: string;
  isGeneratingImage?: boolean;
}

export type LayoutType = '1_panel_splash' | '2_panel_horizontal' | '2_panel_vertical' | '3_panel_triad' | '4_panel_grid';

export interface CartoonPage {
  pageNumber: number;
  pageTitle: string;
  layoutType: LayoutType;
  backgroundSetting: string;
  narrativeText?: string;
  panels: CartoonPanel[];
}

export interface CartoonBookProject {
  id: string;
  title: string;
  subtitle?: string;
  themeConcept: string;
  artStyle: ArtStyle;
  targetAudience: TargetAudience;
  characters: CartoonCharacter[];
  pages: CartoonPage[];
  createdAt: string;
  status: 'draft' | 'generating' | 'completed';
}

export interface GenerateCartoonScriptParams {
  promptConcept: string;
  artStyle: ArtStyle;
  targetAudience: TargetAudience;
  pageCount: number;
  mainCharactersCount: number;
}
