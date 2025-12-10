import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { AUTOSAVE_INTERVAL_MS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

type FlowState = 'PRE_START' | 'WRITING' | 'COMPLETED';
type AnimationState = 'idle' | 'starting' | 'visible' | 'fading';

export const NoteFlow: React.FC = () => {
  const navigate = useNavigate();
  const { settings, addNote, updateNote } = useStore();
  
  const [flowState, setFlowState] = useState<FlowState>('PRE_START');
  const [sessionDuration, setSessionDuration] = useState(settings.timerDuration);
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  
  const [title, setTitle] = useState('');
  const [noteId, setNoteId] = useState<string>('');
  
  // Audio State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Animation State
  const [animState, setAnimState] = useState<AnimationState>('idle');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const autosaveRef = useRef<number | null>(null);

  // Initialize session duration from settings once on mount
  useEffect(() => {
    setSessionDuration(settings.timerDuration);
  }, [settings.timerDuration]);

  // Initialize Audio (Rain/Jungle Ambience)
  useEffect(() => {
    // Using a reliable rain sound (Rain Heavy Loud from Google Sounds)
    const audio = new Audio('https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Audio Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isMusicPlaying) {
        audio.play().catch((e) => console.warn("Audio play blocked:", e));
      } else {
        audio.pause();
      }
    }
  }, [isMusicPlaying]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title]);

  const startSession = () => {
    const newId = uuidv4();
    setNoteId(newId);
    
    addNote({
      id: newId,
      title: '',
      content: '',
      createdAt: Date.now(),
      durationSeconds: sessionDuration,
      isLocked: false
    });

    setTimeLeft(sessionDuration);
    setFlowState('WRITING');
  };

  const saveCurrentState = useCallback(() => {
    if (noteId) {
      const currentContent = contentRef.current?.innerHTML || '';
      updateNote(noteId, currentContent, title);
    }
  }, [noteId, title, updateNote]);

  const finishSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    
    // Stop audio
    if (audioRef.current) {
        audioRef.current.pause();
    }
    
    saveCurrentState();

    // Trigger Animation Sequence
    setAnimState('starting');
    // Allow render to catch 'starting' state before transitioning to 'visible'
    setTimeout(() => setAnimState('visible'), 50);

    // Fade out and Navigate sequence
    setTimeout(() => {
      setAnimState('fading');
      setTimeout(() => {
        setFlowState('COMPLETED');
        navigate(`/note/${noteId}`);
      }, 500); // Matches transition duration
    }, 2000); // Time to read the message

  }, [noteId, saveCurrentState, navigate]);

  // Timer Logic
  useEffect(() => {
    if (flowState === 'WRITING') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flowState, finishSession]);

  // Autosave Logic
  useEffect(() => {
    if (flowState === 'WRITING' && noteId) {
      autosaveRef.current = window.setInterval(() => {
        saveCurrentState();
      }, AUTOSAVE_INTERVAL_MS);
    }
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
    };
  }, [flowState, noteId, saveCurrentState]);

  // Key Handlers
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      contentRef.current?.focus();
    }
  };

  // Editor Commands
  const execCommand = (command: string) => {
    document.execCommand(command, false);
    // Maintain focus on editor
    if (contentRef.current && document.activeElement !== contentRef.current) {
         contentRef.current.focus();
    }
  };

  // Prevent button click from stealing focus
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // PRE_START View
  if (flowState === 'PRE_START') {
    const minutes = Math.floor(sessionDuration / 60);
    
    const adjustTime = (deltaMinutes: number) => {
      setSessionDuration(prev => {
        const newVal = prev + (deltaMinutes * 60);
        return newVal > 60 ? newVal : 60; 
      });
    };

    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="text-center">
          <div className="flex items-center justify-center gap-12 select-none mb-12">
            <button onClick={() => adjustTime(-5)} className="text-4xl opacity-20 hover:opacity-100 transition-opacity p-4 font-light">-</button>
            <div className="text-8xl font-bold tracking-tighter w-48 font-lato">
              {minutes}:00
            </div>
            <button onClick={() => adjustTime(5)} className="text-4xl opacity-20 hover:opacity-100 transition-opacity p-4 font-light">+</button>
          </div>

          <button 
            onClick={startSession}
            className="text-xl font-black tracking-widest border-b-4 border-current pb-1 hover:opacity-60 transition-opacity uppercase"
          >
            Start Writing
          </button>
          
          <div className="mt-12">
             <button onClick={() => navigate('/')} className="text-xs font-bold tracking-widest opacity-30 hover:opacity-100 transition-opacity uppercase">
                Cancel
             </button>
          </div>
        </div>
      </div>
    );
  }

  // WRITING View
  const minDisplay = Math.floor(timeLeft / 60);
  const secDisplay = timeLeft % 60;
  const timeStr = `${minDisplay}:${secDisplay.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground relative">
       {/* Top Spacer/Header */}
       <div className="h-12 w-full"></div>

       {/* Editor Scroll Area */}
       <div className="flex-grow overflow-y-auto px-6 md:px-24 max-w-5xl mx-auto w-full pb-48">
           
           {/* Headline: Auto-expanding textarea */}
           <textarea
            ref={titleRef}
            autoFocus
            rows={1}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Let it Flow..."
            className="w-full text-4xl md:text-5xl font-bold font-lato bg-transparent border-none outline-none resize-none placeholder-gray-300 overflow-hidden mb-6 leading-tight"
            style={{ minHeight: '1.2em' }}
           />

           {/* Paragraph: Continuous content area */}
           <div
             ref={contentRef}
             contentEditable
             className="editor-content w-full min-h-[50vh] text-lg md:text-xl font-lato outline-none leading-relaxed text-foreground/90 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
             data-placeholder="Start writing..."
           />
       </div>
       
       {/* Ambient Sound Toggle - Bottom Left */}
       <div className="absolute bottom-12 left-8 md:left-12 pointer-events-auto z-20">
          <button 
            onClick={() => setIsMusicPlaying(!isMusicPlaying)}
            className={`w-12 h-12 rounded-full border-2 border-current flex items-center justify-center transition-all duration-300 hover:scale-105 ${isMusicPlaying ? 'bg-foreground text-background' : 'bg-background text-foreground hover:bg-foreground/10'}`}
            title="Toggle Rain Ambience"
          >
            {isMusicPlaying ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.468 8.282a5 5 0 010 7.436M5 12a1 1 0 001 1h2.586l4.707 4.707C14.077 18.52 15 18.053 15 17V7c0-1.053-.923-1.52-1.707-.854L8.586 11H6a1 1 0 00-1 1z" />
               </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
               </svg>
            )}
          </button>
       </div>

       {/* Integrated Floating Toolbar - Bottom Center */}
       <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center pointer-events-none z-10">
         <div className="bg-background shadow-2xl border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-4 flex items-center gap-6 pointer-events-auto transform transition-transform hover:scale-105">
            
            {/* Formatting Buttons with Stroke */}
            <div className="flex gap-3">
                <button 
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => execCommand('bold')}
                    className="border-2 border-current rounded-md px-3 py-1 font-bold font-lato text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                    B
                </button>
                <button 
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => execCommand('italic')}
                    className="border-2 border-current rounded-md px-3 py-1 font-bold font-lato italic text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                    I
                </button>
                <button 
                    onMouseDown={handleToolbarMouseDown}
                    onClick={() => execCommand('insertUnorderedList')}
                    className="border-2 border-current rounded-md px-3 py-1 font-bold font-lato text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                    •
                </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-current opacity-10"></div>

            {/* Timer with Emphasis */}
            <div className="font-mono text-2xl font-black tracking-widest text-foreground select-none">
                {timeStr}
            </div>

         </div>
       </div>

       {/* Completion Animation Overlay */}
       {animState !== 'idle' && (
         <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-500 ease-out
            ${animState === 'starting' ? 'opacity-0 scale-95' : ''}
            ${animState === 'visible' ? 'opacity-100 scale-100' : ''}
            ${animState === 'fading' ? 'opacity-0 scale-105' : ''}
         `}>
            <h1 className="text-4xl md:text-6xl font-black tracking-widest uppercase text-foreground drop-shadow-sm px-4 text-center">
                Good. You finished!
            </h1>
         </div>
       )}
    </div>
  );
};