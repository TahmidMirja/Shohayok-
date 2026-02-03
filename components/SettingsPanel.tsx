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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-float">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-darker">
          <h2 className="text-xl font-bold text-white font-bangla">সেটিংস (Settings)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">আপনার নাম (Your Name)</label>
            <input 
              type="text" 
              value={formData.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">এআই নাম (AI Name)</label>
            <input 
              type="text" 
              value={formData.aiName}
              onChange={(e) => handleChange('aiName', e.target.value)}
              className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">ব্যক্তিত্ব (Personality)</label>
            <select 
              value={formData.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
              className="w-full bg-dark border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="jarvis">Jarvis (Professional & Cool)</option>
              <option value="casual">Friendly (Casual)</option>
              <option value="witty">Witty (Humorous)</option>
              <option value="formal">Formal (Strict)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-300">ভয়েস আউটপুট (Voice Output)</span>
            <button 
              onClick={() => handleChange('voiceEnabled', !formData.voiceEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${formData.voiceEnabled ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.voiceEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-700">
             <button 
              onClick={onClearMemory}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
             >
               <RefreshCw size={14} />
               মেমোরি ক্লিয়ার করুন (Clear Memory)
             </button>
          </div>

        </div>

        <div className="p-6 border-t border-slate-700 bg-darker flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary hover:bg-sky-400 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Save size={18} />
            সেভ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
