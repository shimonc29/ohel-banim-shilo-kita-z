import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Upload, Plus, Trash2, 
  CheckCircle2, Circle, Calendar, Clock, Star, Heart, Share2, Music, Settings, 
  Sparkles, Edit2, Check, X
} from 'lucide-react';

export default function App() {
  // --- מצבים שמורים ב-LocalStorage ---
  // הגדרות טיימר (בדקות)
  const [workDuration, setWorkDuration] = useState(() => Number(localStorage.getItem('holo_work')) || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(() => Number(localStorage.getItem('holo_short')) || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(() => Number(localStorage.getItem('holo_long')) || 15);
  const [longBreakInterval, setLongBreakInterval] = useState(() => Number(localStorage.getItem('holo_interval')) || 4);

  // מצבי טיימר דינמיים
  const [mode, setMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => Number(localStorage.getItem('holo_completed_sessions')) || 0);
  const [sessionStreak, setSessionStreak] = useState(() => Number(localStorage.getItem('holo_streak')) || 0);

  // משימות ולוח זמנים
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('holo_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'עיצוב ממשק הולוגרפי לעבודה', completed: false, estimated: 3, actual: 1, date: new Date().toISOString().split('T')[0] },
      { id: 2, text: 'סקירת יעדי מיקוד יומיים', completed: true, estimated: 1, actual: 1, date: new Date().toISOString().split('T')[0] }
    ];
  });

  // שמירת אירועים שעתיים ואירועים מותאמים אישית לפי תאריכים ב-LocalStorage
  const [scheduleData, setScheduleData] = useState(() => {
    const saved = localStorage.getItem('holo_schedule_data');
    return saved ? JSON.parse(saved) : {};
  });
  const [editingHour, setEditingHour] = useState(null);
  const [editingText, setEditingText] = useState('');

  // משימות חדשות לפי שעות ודקות מדויקות
  const [customTime, setCustomTime] = useState('12:00');
  const [customTaskText, setCustomTaskText] = useState('');

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskEst, setNewTaskEst] = useState(1);
  const [taskMode, setTaskMode] = useState('pomo'); // 'simple' | 'pomo'

  // פונקציות לניהול משימות
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      estimated: Number(newTaskEst) || 1,
      actual: 0,
      date: selectedDate
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    setNewTaskEst(1);
  };

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // בחירת תאריך ללוח השנה
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'tasks' | 'schedule' | 'settings'

  // נגן אודיו ומוזיקת רקע
  const [activeSound, setActiveSound] = useState('rain'); // 'rain' | 'lofi' | 'white' | 'ambient' | 'custom'
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);
  const [customAudioName, setCustomAudioName] = useState('');

  // דירוג ולייקים
  const [likes, setLikes] = useState(() => Number(localStorage.getItem('holo_likes')) || 42);
  const [hasLiked, setHasLiked] = useState(() => localStorage.getItem('holo_has_liked') === 'true');
  const [rating, setRating] = useState(() => Number(localStorage.getItem('holo_rating')) || 5);

  // הטרפות (Refs)
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // מקורות שמע
  const soundSources = {
    rain: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_4f09a56a67.mp3?filename=soft-rain-ambient-111154.mp3',
    lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    white: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a14b31.mp3?filename=white-noise-103328.mp3',
    ambient: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-mountains-rivers-141318.mp3'
  };

  // סנכרון ל-LocalStorage
  useEffect(() => {
    localStorage.setItem('holo_work', workDuration);
    localStorage.setItem('holo_short', shortBreakDuration);
    localStorage.setItem('holo_long', longBreakDuration);
    localStorage.setItem('holo_interval', longBreakInterval);
    localStorage.setItem('holo_completed_sessions', completedSessions);
    localStorage.setItem('holo_streak', sessionStreak);
    localStorage.setItem('holo_tasks', JSON.stringify(tasks));
    localStorage.setItem('holo_schedule_data', JSON.stringify(scheduleData));
    localStorage.setItem('holo_likes', likes);
    localStorage.setItem('holo_has_liked', hasLiked);
    localStorage.setItem('holo_rating', rating);
  }, [workDuration, shortBreakDuration, longBreakDuration, longBreakInterval, completedSessions, sessionStreak, tasks, scheduleData, likes, hasLiked, rating]);
  // עדכון זמנים בעת שינוי הגדרות
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(workDuration * 60);
      else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
      else if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, mode]);

  // עדכון כותרת הלשונית בדפדפן
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, '0');
    const modeLabel = mode === 'work' ? '🎯 מיקוד' : mode === 'shortBreak' ? '☕ הפסקה קצרה' : '🌴 הפסקה ארוכה';
    document.title = `${mins}:${secs} - ${modeLabel} | HoloFocus`;
  }, [timeLeft, mode]);

  // לולאת הטיימר הראשית
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerCompletion();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // לוגיקת סיום סשן
  const handleTimerCompletion = () => {
    setIsRunning(false);
    playNotificationSound();

    if (mode === 'work') {
      const nextCompleted = completedSessions + 1;
      setCompletedSessions(nextCompleted);
      setSessionStreak(prev => prev + 1);

      // עדכון מספר הפומודורו למשימה הפעילה הראשונה
      setTasks(prev => {
        let updated = false;
        return prev.map(task => {
          if (!updated && !task.completed) {
            updated = true;
            return { ...task, actual: task.actual + 1 };
          }
          return task;
        });
      });

      if (nextCompleted % longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('שגיאת אודיו', e);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(workDuration * 60);
    else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else setTimeLeft(longBreakDuration * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('shortBreak');
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  // ניהול נגן השמע
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleAudioToggle = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(err => console.log('שגיאת השמעה:', err));
    }
  };

  const changeSound = (soundKey) => {
    setActiveSound(soundKey);
    setIsAudioPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(e => console.log(e));
      }
    }, 100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioName(file.name);
      setActiveSound('custom');
      setIsAudioPlaying(false);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(e => console.log(e));
        }
      }, 100);
    }
  };

  // ניהול משימות לוח זמנים שעתי
  const handleSaveHourlyItem = (hourKey) => {
    const key = `${selectedDate}_${hourKey}`;
    setScheduleData(prev => ({
      ...prev,
      [key]: editingText.trim()
    }));
    setEditingHour(null);
    setEditingText('');
  };

  const handleStartEditHourlyItem = (hourKey, currentText) => {
    setEditingHour(hourKey);
    setEditingText(currentText || '');
  };

  const handleDeleteHourlyItem = (hourKey) => {
    const key = `${selectedDate}_${hourKey}`;
    setScheduleData(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // הוספת אירוע מותאם לפי שעה ודקה מדויקות
  const handleAddCustomTimeTask = (e) => {
    e.preventDefault();
    if (!customTaskText.trim()) return;

    const key = `${selectedDate}_${customTime}`;
    setScheduleData(prev => ({
      ...prev,
      [key]: customTaskText.trim()
    }));
    setCustomTaskText('');
  };

  // לייקים ושיתוף
  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    } else {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    }
  };

  const shareWhatsApp = () => {
    const text = `🔥 השלמתי רצף של ${sessionStreak} סשנים ב-HoloFocus! ${completedSessions} סשנים של מיקוד עמוק היום. הצטרפו אלי ללמידה ממוקדת:`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // פורמט זמן
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentAudioSrc = activeSound === 'custom' ? customAudioUrl : soundSources[activeSound];
  const maxTime = mode === 'work' ? workDuration * 60 : mode === 'shortBreak' ? shortBreakDuration * 60 : longBreakDuration * 60;
  const progressPercent = ((maxTime - timeLeft) / maxTime) * 100;

  const filteredTasks = tasks.filter(t => t.date === selectedDate);
  const totalEst = filteredTasks.reduce((acc, t) => acc + t.estimated, 0);
  const totalAct = filteredTasks.reduce((acc, t) => acc + t.actual, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      
      {/* תאורת הולוגרמה ברקע */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="fixed top-1/2 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* רשת רקע */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#38bdf8_1px,transparent_1px)]"
        style={{ backgroundSize: '24px 24px' }}
      ></div>

      {/* ניווט עליון */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-cyan-500/20 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-emerald-400 bg-clip-text text-transparent">
            הולו<span className="font-light">פוקוס</span>
          </span>
        </div>

        {/* לשוניות ניווט */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'timer'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 inline sm:ml-1.5" />
            <span className="hidden sm:inline">טיימר</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 inline sm:ml-1.5" />
            <span className="hidden sm:inline">משימות</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline sm:ml-1.5" />
            <span className="hidden sm:inline">לו"ז יומי</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 inline sm:ml-1.5" />
            <span className="hidden sm:inline">הגדרות</span>
          </button>
        </nav>

        {/* כפתור שיתוף */}
        <div className="flex items-center gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10"
            title="שתף רצף בוואטסאפ"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">שתף</span>
          </button>
        </div>
      </header>

      {/* תוכן מרכזי */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* לשונית 1: טיימר ראשי */}
        {activeTab === 'timer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* עמודה ימנית: תצוגת טיימר */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* בחירת מצב עבודה */}
              <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md mb-8 gap-2">
                <button
                  onClick={() => { setMode('work'); setIsRunning(false); setTimeLeft(workDuration * 60); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'work'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🎯 מיקוד ({workDuration} דק')
                </button>
                <button
                  onClick={() => { setMode('shortBreak'); setIsRunning(false); setTimeLeft(shortBreakDuration * 60); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'shortBreak'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ☕ קצרה ({shortBreakDuration} דק')
                </button>
                <button
                  onClick={() => { setMode('longBreak'); setIsRunning(false); setTimeLeft(longBreakDuration * 60); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'longBreak'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌴 ארוכה ({longBreakDuration} דק')
                </button>
              </div>

              {/* טבעת טיימר הולוגרפית */}
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center my-4">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="44"
                    className="stroke-slate-900"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50" cy="50" r="44"
                    className="stroke-cyan-400 transition-all duration-1000 ease-linear"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-4 rounded-full bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 flex flex-col items-center justify-center shadow-inner shadow-cyan-500/10">
                  <span className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="mt-2 text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                    {mode === 'work' ? 'סשן מיקוד' : mode === 'shortBreak' ? 'מנוחה קצרה' : 'מנוחה ארוכה'}
                  </span>
                  <span className="mt-1 text-[11px] text-slate-500">
                    רצף נוכחי: <strong className="text-emerald-400">{sessionStreak}</strong> 🔥
                  </span>
                </div>
              </div>

              {/* מקשי שליטה */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={resetTimer}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                  title="איפוס טיימר"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleTimer}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 text-slate-950 font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current rotate-180" />}
                  <span>{isRunning ? 'השהה' : 'התחל מיקוד'}</span>
                </button>

                <button
                  onClick={skipTimer}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                  title="דלג למצב הבא"
                >
                  <SkipForward className="w-5 h-5 rotate-180" />
                </button>
              </div>

            </div>

            {/* עמודה שמאלית: נגן סאונד וצלילים */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-slate-200">צלילי אווירה ומוזיקה</h3>
                  </div>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-cyan-400 transition"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <audio ref={audioRef} src={currentAudioSrc} loop />

                {/* לחצני סאונד מובנים */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {[
                    { id: 'rain', label: '🌧️ גשם רגוע' },
                    { id: 'lofi', label: '🎧 מוזיקת Lo-Fi' },
                    { id: 'white', label: '📻 רעש לבן' },
                    { id: 'ambient', label: '🌲 נחל ויער' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => changeSound(preset.id)}
                      className={`p-3 rounded-xl text-xs font-medium text-right border transition-all ${
                        activeSound === preset.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* העלאת קובץ שמע אישי */}
                <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 flex items-center justify-between">
                  <div className="truncate ml-2">
                    <span className="block text-xs text-slate-400">קובץ שמע אישי:</span>
                    <span className="text-xs font-mono text-cyan-300 truncate block">
                      {customAudioName || 'לא נבחר קובץ MP3'}
                    </span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 shrink-0 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>העלה</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* בקרת עוצמת שמע */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleAudioToggle}
                    className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition shrink-0"
                  >
                    {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 rotate-180" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>עוצמת שמע</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* סיכום יומי מהיר */}
              <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">סיכום סשנים יומי</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-2xl font-bold text-cyan-400">{completedSessions}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">סשנים הושלמו</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-2xl font-bold text-emerald-400">{totalAct} / {totalEst}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">פומודורו (בוצע/מוערך)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* לשונית 2: ניהול משימות */}
        {activeTab === 'tasks' && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-100">רשימת משימות ומיקוד</h2>
                <p className="text-xs text-slate-400 mt-1">נהל והערך את מספר הסשנים הנדרשים לכל משימה.</p>
              </div>

              {/* החלפת מצב משימות */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTaskMode('pomo')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    taskMode === 'pomo' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  מצב ספירת פומודורו
                </button>
                <button
                  onClick={() => setTaskMode('simple')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    taskMode === 'simple' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  רשימה פשוטה
                </button>
              </div>
            </div>

            {/* טופס הוספת משימה */}
            <form onSubmit={addTask} className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="על מה תרצה לעבוד היום?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 w-full"
              />
              
              {taskMode === 'pomo' && (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                  <span className="text-xs text-slate-400">ערך סשנים:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newTaskEst}
                    onChange={(e) => setNewTaskEst(e.target.value)}
                    className="w-12 bg-transparent text-cyan-400 font-bold text-sm text-center focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>הוסף משימה</span>
              </button>
            </form>

            {/* רשימת המשימות */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-500 text-sm">
                  אין משימות מתוכננות לתאריך {selectedDate}. צור משימה חדשה למעלה!
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="text-slate-400 hover:text-cyan-400 transition shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </button>
                      <span className="text-sm font-medium">{task.text}</span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {taskMode === 'pomo' && (
                        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                          <span className="text-cyan-400">{task.actual}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-slate-400">{task.estimated} סשנים</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-600 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* לשונית 3: לוח זמנים ולוח שנה */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* בורר תאריכים וטופס הוספת שעה ודקה מדויקות */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-200">בחירת תאריך</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setEditingHour(null);
                    }}
                    className="bg-slate-950 text-cyan-400 text-xs px-3 py-1.5 rounded-xl border border-cyan-500/30 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                  <span className="text-xs text-slate-400 block">מציג לו"ז עבור:</span>
                  <span className="text-lg font-mono font-bold text-cyan-300">
                    {new Date(selectedDate).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* הוספת אירוע מותאם לפי שעות ודקות */}
              <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4">
                <h3 className="font-semibold text-slate-200 text-sm">הוסף משימה לפי שעה ודקה</h3>
                
                <form onSubmit={handleAddCustomTimeTask} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">בחר שעה ודקה:</label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full bg-slate-950 text-cyan-400 text-sm font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">תיאור המשימה / הפגישה:</label>
                    <input
                      type="text"
                      placeholder="לדוגמה: שיחת צוות, סקירת פרויקט..."
                      value={customTaskText}
                      onChange={(e) => setCustomTaskText(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/40 hover:bg-cyan-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף ללו"ז</span>
                  </button>
                </form>
              </div>
            </div>

            {/* תצוגת לוח זמנים שעתי אינטראקטיבי */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-200">לוח זמנים יומי (לו"ז)</h3>
                <span className="text-xs text-slate-400">לחץ על משבצת כדי לערוך או להוסיף</span>
              </div>
              
              <div className="space-y-3 max-h-[550px] overflow-y-auto pl-2 custom-scrollbar">
                {(() => {
                  // יצירת רשימה מאוחדת של שעות קבועות + שעות אישיות שהוזנו
                  const defaultHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(h => `${h.toString().padStart(2, '0')}:00`);
                  
                  // איתור מפתחות קיימים בזיכרון עבור התאריך שנבחר
                  const datePrefix = `${selectedDate}_`;
                  const customKeys = Object.keys(scheduleData)
                    .filter(k => k.startsWith(datePrefix))
                    .map(k => k.replace(datePrefix, ''));

                  // מיזוג ומיון השעות לפי סדר כרונולוגי
                  const allTimeSlots = Array.from(new Set([...defaultHours, ...customKeys])).sort();

                  return allTimeSlots.map((timeSlot) => {
                    const itemKey = `${selectedDate}_${timeSlot}`;
                    const itemContent = scheduleData[itemKey] || '';
                    const isEditing = editingHour === timeSlot;

                    return (
                      <div key={timeSlot} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-cyan-500/30 transition group">
                        <span className="text-xs font-mono text-cyan-400 w-14 shrink-0 font-bold">{timeSlot}</span>
                        
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveHourlyItem(timeSlot);
                                  if (e.key === 'Escape') setEditingHour(null);
                                }}
                                placeholder="רשום משימה או פגישה לשעה זו..."
                                className="flex-1 bg-slate-950 text-xs text-cyan-200 px-3 py-1.5 rounded-xl border border-cyan-500/50 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveHourlyItem(timeSlot)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                                title="שמור"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingHour(null)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition"
                                title="ביטול"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartEditHourlyItem(timeSlot, itemContent)}
                              className="cursor-pointer min-h-[32px] flex items-center justify-between"
                            >
                              {itemContent ? (
                                <span className="text-xs text-slate-200 font-medium px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 block w-full text-right">
                                  {itemContent}
                                </span>
                              ) : (
                                <span className="text-xs italic text-slate-600 hover:text-slate-400 transition">
                                  + לחץ להוספת משימה לשעה {timeSlot}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleStartEditHourlyItem(timeSlot, itemContent)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 transition"
                              title="ערוך"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {itemContent && (
                              <button
                                onClick={() => handleDeleteHourlyItem(timeSlot)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                                title="מחק"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        )}

        {/* לשונית 4: הגדרות טיימר */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">הגדרות טיימר</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">משך סשן מיקוד (בדקות)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">משך הפסקה קצרה (בדקות)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">משך הפסקה ארוכה (בדקות)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">תדירות הפסקה ארוכה (מספר סשנים)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={longBreakInterval}
                  onChange={(e) => setLongBreakInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
              כל העדפות השימוש נשמרות באופן אוטומטי בדפדפן (LocalStorage).
            </div>
          </div>
        )}

      </main>

      {/* פוטר ודירוגים */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                hasLiked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likes}</span>
            </button>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-slate-600 hover:text-amber-400 transition"
                >
                  <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            HoloFocus &copy; {new Date().getFullYear()} • מערכת מיקוד הולוגרפית
          </div>
        </div>
      </footer>
    </div>
  );
}