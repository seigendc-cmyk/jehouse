import React, { useState } from 'react';
import { CartoonCharacter } from '../types';
import { UserPlus, Sparkles, Trash2, Edit2, Palette, Smile } from 'lucide-react';

interface CharacterSheetEditorProps {
  characters: CartoonCharacter[];
  onUpdateCharacters: (characters: CartoonCharacter[]) => void;
}

export const CharacterSheetEditor: React.FC<CharacterSheetEditorProps> = ({
  characters,
  onUpdateCharacters
}) => {
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;

    const newCharacter: CartoonCharacter = {
      id: `char-${Date.now()}`,
      name: newCharName.trim(),
      speciesRole: newCharRole.trim() || 'Hero Character',
      visualDescription: newCharDesc.trim() || 'Expressive cartoon character with vibrant attire.',
      personality: 'Friendly and energetic',
      colorPalette: '#FF6B00, #3B82F6, #10B981',
      avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(newCharName)}/300/300`
    };

    onUpdateCharacters([...characters, newCharacter]);
    setNewCharName('');
    setNewCharRole('');
    setNewCharDesc('');
  };

  const handleDeleteCharacter = (id: string) => {
    onUpdateCharacters(characters.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-5 space-y-5 text-gray-100">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Smile className="w-4 h-4 text-amber-400" />
            Cartoon Cast & Character Sheets
          </h3>
          <p className="text-xs text-gray-400">
            Maintain consistent visual identities for AI panel generation.
          </p>
        </div>
      </div>

      {/* Characters List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className="bg-[#212121] border border-[#333333] hover:border-amber-500/50 rounded-xl p-3.5 space-y-3 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-start gap-3">
              <img
                src={char.avatarUrl || `https://picsum.photos/seed/${char.id}/150/150`}
                alt={char.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-lg object-cover border-2 border-amber-400 shrink-0 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{char.name}</h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold block w-fit mt-0.5">
                  {char.speciesRole}
                </span>
                <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                  {char.visualDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#2D2D2D] pt-2 mt-2 text-[11px] text-gray-400">
              <span className="font-mono">{char.personality}</span>
              <button
                onClick={() => handleDeleteCharacter(char.id)}
                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 cursor-pointer transition-colors"
                title="Remove Character"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Character Form */}
      <div className="p-4 bg-[#141414] border border-[#2D2D2D] rounded-lg space-y-3">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          Add New Cast Character
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            placeholder="Character Name (e.g. Captain Spark)..."
            className="p-2.5 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="text"
            value={newCharRole}
            onChange={(e) => setNewCharRole(e.target.value)}
            placeholder="Role / Species (e.g. Robot Sidekick)..."
            className="p-2.5 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <textarea
          value={newCharDesc}
          onChange={(e) => setNewCharDesc(e.target.value)}
          rows={2}
          placeholder="Visual description (e.g. Wearing blue goggles, yellow cape, round eyes)..."
          className="w-full p-2.5 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400 resize-none"
        />

        <button
          onClick={handleAddCharacter}
          disabled={!newCharName.trim()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Save Character Sheet
        </button>
      </div>
    </div>
  );
};
