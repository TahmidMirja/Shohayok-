import React from 'react';
import { UserPreferences } from '../types';
import { X, Save, RefreshCw } from 'lucide-react';

interface Props {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
  onClose: () => void;
  onClearMemory: () => void;
}

export const SettingsPanel: React.FC<Props> = ({ preferences, onUpdate, onClose, onClearMemory }) => {
  const [formData, setFormData] = React.useState<UserPreferences>(preferences);

  const handleChange = (key: keyof UserPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#110800] border border-holo/30 w-full max-w-md rounded-none shadow-2xl overflow-hidden font-sans">
        <div className="flex justify-between items-center p-6 border-b border-holo/20 bg-holo/5">
          <h2 className="text-xl font-bold text-holo font-bangla uppercase tracking-widest">সেটিংস (Settings)</h2>
          <button onClick={onClose} className="text-holo/60 hover:text-holo transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          <div>
            <label className="block text-[10px] font-mono font-bold text-holo/60 mb-2 uppercase tracking-tighter">আপনার নাম (User ID)</label>
            <input 
              type="text" 
              value={formData.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className="w-full bg-black border border-holo/20 rounded-none px-4 py-2 text-white focus:outline-none focus:border-holo transition-colors font-bangla"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-holo/60 mb-2 uppercase tracking-tighter">এআই নাম (AI Designation)</label>
            <input 
              type="text" 
              value={formData.aiName}
              onChange={(e) => handleChange('aiName', e.target.value)}
              className="w-full bg-black border border-holo/20 rounded-none px-4 py-2 text-white focus:outline-none focus:border-holo transition-colors font-bangla"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-holo/60 mb-2 uppercase tracking-tighter">ব্যক্তিত্ব (Personality Profile)</label>
            <select 
              value={formData.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
              className="w-full bg-black border border-holo/20 rounded-none px-4 py-2 text-white focus:outline-none focus:border-holo transition-colors appearance-none font-sans"
            >
              <option value="jarvis">TACTICAL (JARVIS)</option>
              <option value="casual">CASUAL</option>
              <option value="witty">WITTY</option>
              <option value="formal">FORMAL</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-y border-holo/5">
            <span className="text-holo/80 text-sm font-bangla">ভয়েস আউটপুট (Voice Output)</span>
            <button 
              onClick={() => handleChange('voiceEnabled', !formData.voiceEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${formData.voiceEnabled ? 'bg-holo' : 'bg-holo/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.voiceEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="pt-2">
             <button 
              onClick={onClearMemory}
              className="flex items-center gap-2 text-danger/80 hover:text-danger text-xs transition-colors font-mono tracking-widest uppercase"
             >
               <RefreshCw size={14} />
               Purge System Memory
             </button>
          </div>

        </div>

        <div className="p-6 border-t border-holo/20 bg-holo/5 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-holo/10 hover:bg-holo hover:text-black border border-holo text-holo px-8 py-2 rounded-none font-bold transition-all shadow-lg"
          >
            <Save size={18} />
            SAVE SYNC
          </button>
        </div>
      </div>
    </div>
  );
};
