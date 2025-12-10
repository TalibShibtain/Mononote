import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/Button';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useStore();

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      updateSettings({ timerDuration: val * 60 });
    }
  };

  const currentDurationMinutes = Math.floor(settings.timerDuration / 60);

  return (
    <div className="flex flex-col h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-start mb-24 border-b-2 border-current pb-4">
        <Button onClick={() => navigate('/')}>Back</Button>
        <h1 className="font-bold text-xl tracking-tighter">SETTINGS</h1>
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      <main className="flex-grow flex flex-col gap-16 max-w-xl">
        
        {/* Theme Toggle */}
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold border-l-4 border-current pl-4">THEME</h2>
            <div className="flex gap-8 pl-5">
                <button 
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`text-xl font-bold ${settings.theme === 'light' ? 'underline underline-offset-8' : 'opacity-30'}`}
                >
                    LIGHT
                </button>
                <button 
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`text-xl font-bold ${settings.theme === 'dark' ? 'underline underline-offset-8' : 'opacity-30'}`}
                >
                    DARK
                </button>
            </div>
        </div>

        {/* Timer Duration */}
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold border-l-4 border-current pl-4">TIMER DURATION (MIN)</h2>
            <div className="pl-5">
                <input 
                    type="number" 
                    value={currentDurationMinutes}
                    onChange={handleDurationChange}
                    className="text-6xl font-bold bg-transparent border-b-2 border-current w-full focus:outline-none p-2"
                />
                <p className="mt-4 opacity-50 text-sm">
                    Default duration for new flow sessions.
                </p>
            </div>
        </div>

      </main>
    </div>
  );
};