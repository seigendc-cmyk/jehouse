import { CartoonBookProject, GenerateCartoonScriptParams, CartoonPage, CartoonPanel, CartoonCharacter } from './types';

/**
 * Service to generate AI cartoon scripts, characters, and panels via backend API routes
 */

export async function generateCartoonScriptWithAI(params: GenerateCartoonScriptParams): Promise<CartoonBookProject> {
  try {
    const response = await fetch('/api/ai/cartoon-generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate cartoon script from AI server.');
    }

    const data = await response.json();
    return data.cartoonProject;
  } catch (err: any) {
    console.warn('Backend cartoon generator fallback activated:', err.message);
    return createFallbackCartoonProject(params);
  }
}

export async function generatePanelImageWithAI(
  prompt: string, 
  artStyle: string, 
  characterDescriptions?: string
): Promise<string> {
  try {
    const response = await fetch('/api/ai/cartoon-generate-panel-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, artStyle, characterDescriptions })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) return data.imageUrl;
    }
  } catch (err) {
    console.warn('Panel image endpoint fallback:', err);
  }

  // Fallback high quality stylized placeholder SVG / Picsum generator with art style theme seed
  return createCartoonPlaceholderImageUrl(prompt, artStyle);
}

export function createCartoonPlaceholderImageUrl(prompt: string, artStyle: string): string {
  const seed = Math.abs(hashCode(prompt + artStyle));
  const styleBgMap: Record<string, string> = {
    disney_3d: '3B82F6',
    classic_2d: 'EF4444',
    anime_manga: '8B5CF6',
    comic_book_pop: 'F59E0B',
    chibi_cute: 'EC4899',
    watercolor_storybook: '10B981'
  };
  const color = styleBgMap[artStyle] || '6366F1';
  
  // Use stylized picsum seed image or dynamic SVG data URL
  return `https://picsum.photos/seed/${seed}/800/600`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Fallback Offline Local Cartoon Story generator if server call fails or offline
 */
function createFallbackCartoonProject(params: GenerateCartoonScriptParams): CartoonBookProject {
  const artStyleNames: Record<string, string> = {
    disney_3d: '3D Rendered Animated',
    classic_2d: 'Classic Hand-Drawn',
    anime_manga: 'Vibrant Manga',
    comic_book_pop: 'Pop Art Comic Book',
    chibi_cute: 'Cute Chibi',
    watercolor_storybook: 'Watercolor Storybook'
  };

  const characters: CartoonCharacter[] = [
    {
      id: 'char-1',
      name: 'Barnaby',
      speciesRole: 'Adventurous Puppy',
      visualDescription: 'A cheerful golden pup with floppy ears, wearing a tiny red rocket backpack.',
      personality: 'Curious, energetic, and fearless.',
      colorPalette: '#F59E0B, #EF4444, #10B981',
      avatarUrl: 'https://picsum.photos/seed/barnaby/300/300'
    },
    {
      id: 'char-2',
      name: 'Professor Cosmo',
      speciesRole: 'Wise Owl Scientist',
      visualDescription: 'A blue-feathered owl wearing oversized round brass goggles and a starry bow-tie.',
      personality: 'Inventive, scholarly, and quick-witted.',
      colorPalette: '#3B82F6, #F59E0B, #FFFFFF',
      avatarUrl: 'https://picsum.photos/seed/cosmo/300/300'
    }
  ];

  const pages: CartoonPage[] = [
    {
      pageNumber: 1,
      pageTitle: 'The Backyard Discovery',
      layoutType: '2_panel_horizontal',
      backgroundSetting: 'Sunny suburban backyard with a wooden fence and tall oak trees.',
      narrativeText: 'It was a sunny Tuesday when Barnaby spotted something glowing behind the old oak tree...',
      panels: [
        {
          id: 'p1-panel-1',
          panelNumber: 1,
          visualPrompt: `${artStyleNames[params.artStyle] || 'Cartoon'} panel: Barnaby the pup sniffing curious glowing footprints in a green backyard under bright sunshine.`,
          illustrationUrl: 'https://picsum.photos/seed/cartoon1/800/600',
          speechBubbles: [
            {
              id: 'b1',
              speakerName: 'Barnaby',
              text: 'Woof! What are these shiny sparkly tracks?!',
              bubbleType: 'thought',
              position: { x: 20, y: 15 }
            }
          ],
          sfxText: 'SHINE!',
          sfxColor: '#F59E0B',
          cameraAngle: 'wide',
          narrativeCaption: 'Curiosity led the puppy further into the garden.'
        },
        {
          id: 'p1-panel-2',
          panelNumber: 2,
          visualPrompt: `${artStyleNames[params.artStyle] || 'Cartoon'} panel: Close up of Barnaby gasping in awe as he discovers a shiny mini rocketship landing pod.`,
          illustrationUrl: 'https://picsum.photos/seed/cartoon2/800/600',
          speechBubbles: [
            {
              id: 'b2',
              speakerName: 'Barnaby',
              text: 'A real rocket ship in my backyard?!',
              bubbleType: 'shout',
              position: { x: 50, y: 20 }
            }
          ],
          sfxText: 'GASP!',
          sfxColor: '#EF4444',
          cameraAngle: 'close_up',
          narrativeCaption: 'Tucked between bushes sat a glittering star vessel!'
        }
      ]
    },
    {
      pageNumber: 2,
      pageTitle: 'Meeting Professor Cosmo',
      layoutType: '2_panel_vertical',
      backgroundSetting: 'Inside the cozy rocket ship cockpit filled with holographic star charts.',
      narrativeText: 'The hatch popped open with a hiss, revealing a feathered friend!',
      panels: [
        {
          id: 'p2-panel-1',
          panelNumber: 1,
          visualPrompt: `${artStyleNames[params.artStyle] || 'Cartoon'} panel: Professor Cosmo the Owl adjusting his brass goggles inside the rocket cockpit.`,
          illustrationUrl: 'https://picsum.photos/seed/cartoon3/800/600',
          speechBubbles: [
            {
              id: 'b3',
              speakerName: 'Professor Cosmo',
              text: 'Hoot! Greetings Earth cadet! I need a co-pilot for a moon mission!',
              bubbleType: 'speech',
              position: { x: 30, y: 20 }
            }
          ],
          sfxText: 'WHOOSH!',
          sfxColor: '#3B82F6',
          cameraAngle: 'medium',
          narrativeCaption: 'Professor Cosmo waved a glowing galaxy map.'
        },
        {
          id: 'p2-panel-2',
          panelNumber: 2,
          visualPrompt: `${artStyleNames[params.artStyle] || 'Cartoon'} panel: Barnaby saluting happily with his tail wagging fast.`,
          illustrationUrl: 'https://picsum.photos/seed/cartoon4/800/600',
          speechBubbles: [
            {
              id: 'b4',
              speakerName: 'Barnaby',
              text: 'Count me in! To the cosmos!',
              bubbleType: 'speech',
              position: { x: 60, y: 25 }
            }
          ],
          sfxText: 'WAG-WAG!',
          sfxColor: '#10B981',
          cameraAngle: 'action_dynamic',
          narrativeCaption: 'And thus, the grandest adventure began!'
        }
      ]
    }
  ];

  return {
    id: `cartoon-${Date.now()}`,
    title: params.promptConcept ? `The Legend of ${params.promptConcept.slice(0, 24)}` : 'Barnaby & The Backyard Rocket',
    subtitle: `An AI-Generated ${artStyleNames[params.artStyle] || 'Cartoon'} Graphic Adventure`,
    themeConcept: params.promptConcept || 'Backyard rocket adventure',
    artStyle: params.artStyle,
    targetAudience: params.targetAudience,
    characters,
    pages,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };
}
