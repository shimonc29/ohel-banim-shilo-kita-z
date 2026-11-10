import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Upload, Plus, Trash2, CheckCircle2, Circle, Calendar, Clock, Star, Heart, Share2, Music, Settings, Sparkles, Edit2, Check, X } from 'lucide-react';
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
        if (!newTaskText.trim())
            return;
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
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
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
            if (mode === 'work')
                setTimeLeft(workDuration * 60);
            else if (mode === 'shortBreak')
                setTimeLeft(shortBreakDuration * 60);
            else if (mode === 'longBreak')
                setTimeLeft(longBreakDuration * 60);
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
        }
        else if (timeLeft === 0 && isRunning) {
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
            }
            else {
                setMode('shortBreak');
                setTimeLeft(shortBreakDuration * 60);
            }
        }
        else {
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
        }
        catch (e) {
            console.log('שגיאת אודיו', e);
        }
    };
    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        if (mode === 'work')
            setTimeLeft(workDuration * 60);
        else if (mode === 'shortBreak')
            setTimeLeft(shortBreakDuration * 60);
        else
            setTimeLeft(longBreakDuration * 60);
    };
    const skipTimer = () => {
        setIsRunning(false);
        if (mode === 'work') {
            setMode('shortBreak');
            setTimeLeft(shortBreakDuration * 60);
        }
        else {
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
        if (!audioRef.current)
            return;
        if (isAudioPlaying) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
        }
        else {
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
        if (!customTaskText.trim())
            return;
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
        }
        else {
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
    return (React.createElement("div", { dir: "rtl", className: "min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col relative overflow-x-hidden" },
        React.createElement("div", { className: "fixed -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" }),
        React.createElement("div", { className: "fixed top-1/2 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" }),
        React.createElement("div", { className: "fixed -bottom-40 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" }),
        React.createElement("div", { className: "fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#38bdf8_1px,transparent_1px)]", style: { backgroundSize: '24px 24px' } }),
        React.createElement("header", { className: "sticky top-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-cyan-500/20 px-4 lg:px-8 py-3 flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center space-x-3 space-x-reverse" },
                React.createElement("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30" },
                    React.createElement(Sparkles, { className: "w-5 h-5 text-slate-950" })),
                React.createElement("span", { className: "text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-emerald-400 bg-clip-text text-transparent" },
                    "\u05D4\u05D5\u05DC\u05D5",
                    React.createElement("span", { className: "font-light" }, "\u05E4\u05D5\u05E7\u05D5\u05E1"))),
            React.createElement("nav", { className: "flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800" },
                React.createElement("button", { onClick: () => setActiveTab('timer'), className: `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'timer'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'}` },
                    React.createElement(Clock, { className: "w-4 h-4 inline sm:ml-1.5" }),
                    React.createElement("span", { className: "hidden sm:inline" }, "\u05D8\u05D9\u05D9\u05DE\u05E8")),
                React.createElement("button", { onClick: () => setActiveTab('tasks'), className: `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'tasks'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'}` },
                    React.createElement(CheckCircle2, { className: "w-4 h-4 inline sm:ml-1.5" }),
                    React.createElement("span", { className: "hidden sm:inline" }, "\u05DE\u05E9\u05D9\u05DE\u05D5\u05EA")),
                React.createElement("button", { onClick: () => setActiveTab('schedule'), className: `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'schedule'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'}` },
                    React.createElement(Calendar, { className: "w-4 h-4 inline sm:ml-1.5" }),
                    React.createElement("span", { className: "hidden sm:inline" }, "\u05DC\u05D5\"\u05D6 \u05D9\u05D5\u05DE\u05D9")),
                React.createElement("button", { onClick: () => setActiveTab('settings'), className: `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'settings'
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'}` },
                    React.createElement(Settings, { className: "w-4 h-4 inline sm:ml-1.5" }),
                    React.createElement("span", { className: "hidden sm:inline" }, "\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA"))),
            React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("button", { onClick: shareWhatsApp, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10", title: "\u05E9\u05EA\u05E3 \u05E8\u05E6\u05E3 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4" },
                    React.createElement(Share2, { className: "w-3.5 h-3.5" }),
                    React.createElement("span", { className: "hidden md:inline" }, "\u05E9\u05EA\u05E3")))),
        React.createElement("main", { className: "flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8" },
            activeTab === 'timer' && (React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" },
                React.createElement("div", { className: "lg:col-span-7 flex flex-col items-center" },
                    React.createElement("div", { className: "flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md mb-8 gap-2" },
                        React.createElement("button", { onClick: () => { setMode('work'); setIsRunning(false); setTimeLeft(workDuration * 60); }, className: `px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${mode === 'work'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                                : 'text-slate-400 hover:text-slate-200'}` },
                            "\uD83C\uDFAF \u05DE\u05D9\u05E7\u05D5\u05D3 (",
                            workDuration,
                            " \u05D3\u05E7')"),
                        React.createElement("button", { onClick: () => { setMode('shortBreak'); setIsRunning(false); setTimeLeft(shortBreakDuration * 60); }, className: `px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${mode === 'shortBreak'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                                : 'text-slate-400 hover:text-slate-200'}` },
                            "\u2615 \u05E7\u05E6\u05E8\u05D4 (",
                            shortBreakDuration,
                            " \u05D3\u05E7')"),
                        React.createElement("button", { onClick: () => { setMode('longBreak'); setIsRunning(false); setTimeLeft(longBreakDuration * 60); }, className: `px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${mode === 'longBreak'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                                : 'text-slate-400 hover:text-slate-200'}` },
                            "\uD83C\uDF34 \u05D0\u05E8\u05D5\u05DB\u05D4 (",
                            longBreakDuration,
                            " \u05D3\u05E7')")),
                    React.createElement("div", { className: "relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center my-4" },
                        React.createElement("svg", { className: "w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]", viewBox: "0 0 100 100" },
                            React.createElement("circle", { cx: "50", cy: "50", r: "44", className: "stroke-slate-900", strokeWidth: "6", fill: "transparent" }),
                            React.createElement("circle", { cx: "50", cy: "50", r: "44", className: "stroke-cyan-400 transition-all duration-1000 ease-linear", strokeWidth: "6", strokeDasharray: 2 * Math.PI * 44, strokeDashoffset: 2 * Math.PI * 44 * (1 - progressPercent / 100), strokeLinecap: "round", fill: "transparent" })),
                        React.createElement("div", { className: "absolute inset-4 rounded-full bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 flex flex-col items-center justify-center shadow-inner shadow-cyan-500/10" },
                            React.createElement("span", { className: "text-5xl sm:text-6xl font-extrabold tracking-tight font-mono bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent" }, formatTime(timeLeft)),
                            React.createElement("span", { className: "mt-2 text-xs uppercase tracking-widest text-cyan-400 font-semibold" }, mode === 'work' ? 'סשן מיקוד' : mode === 'shortBreak' ? 'מנוחה קצרה' : 'מנוחה ארוכה'),
                            React.createElement("span", { className: "mt-1 text-[11px] text-slate-500" },
                                "\u05E8\u05E6\u05E3 \u05E0\u05D5\u05DB\u05D7\u05D9: ",
                                React.createElement("strong", { className: "text-emerald-400" }, sessionStreak),
                                " \uD83D\uDD25"))),
                    React.createElement("div", { className: "flex items-center gap-4 mt-6" },
                        React.createElement("button", { onClick: resetTimer, className: "p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all", title: "\u05D0\u05D9\u05E4\u05D5\u05E1 \u05D8\u05D9\u05D9\u05DE\u05E8" },
                            React.createElement(RotateCcw, { className: "w-5 h-5" })),
                        React.createElement("button", { onClick: toggleTimer, className: "px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 text-slate-950 font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2" },
                            isRunning ? React.createElement(Pause, { className: "w-6 h-6 fill-current" }) : React.createElement(Play, { className: "w-6 h-6 fill-current rotate-180" }),
                            React.createElement("span", null, isRunning ? 'השהה' : 'התחל מיקוד')),
                        React.createElement("button", { onClick: skipTimer, className: "p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all", title: "\u05D3\u05DC\u05D2 \u05DC\u05DE\u05E6\u05D1 \u05D4\u05D1\u05D0" },
                            React.createElement(SkipForward, { className: "w-5 h-5 rotate-180" })))),
                React.createElement("div", { className: "lg:col-span-5 space-y-6" },
                    React.createElement("div", { className: "p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 shadow-xl relative overflow-hidden" },
                        React.createElement("div", { className: "flex items-center justify-between mb-4" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(Music, { className: "w-5 h-5 text-cyan-400" }),
                                React.createElement("h3", { className: "font-semibold text-slate-200" }, "\u05E6\u05DC\u05D9\u05DC\u05D9 \u05D0\u05D5\u05D5\u05D9\u05E8\u05D4 \u05D5\u05DE\u05D5\u05D6\u05D9\u05E7\u05D4")),
                            React.createElement("button", { onClick: () => setIsMuted(!isMuted), className: "text-slate-400 hover:text-cyan-400 transition" }, isMuted ? React.createElement(VolumeX, { className: "w-5 h-5 text-rose-400" }) : React.createElement(Volume2, { className: "w-5 h-5" }))),
                        React.createElement("audio", { ref: audioRef, src: currentAudioSrc, loop: true }),
                        React.createElement("div", { className: "grid grid-cols-2 gap-2.5 mb-5" }, [
                            { id: 'rain', label: '🌧️ גשם רגוע' },
                            { id: 'lofi', label: '🎧 מוזיקת Lo-Fi' },
                            { id: 'white', label: '📻 רעש לבן' },
                            { id: 'ambient', label: '🌲 נחל ויער' },
                        ].map((preset) => (React.createElement("button", { key: preset.id, onClick: () => changeSound(preset.id), className: `p-3 rounded-xl text-xs font-medium text-right border transition-all ${activeSound === preset.id
                                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'}` }, preset.label)))),
                        React.createElement("div", { className: "mb-5 p-3 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 flex items-center justify-between" },
                            React.createElement("div", { className: "truncate ml-2" },
                                React.createElement("span", { className: "block text-xs text-slate-400" }, "\u05E7\u05D5\u05D1\u05E5 \u05E9\u05DE\u05E2 \u05D0\u05D9\u05E9\u05D9:"),
                                React.createElement("span", { className: "text-xs font-mono text-cyan-300 truncate block" }, customAudioName || 'לא נבחר קובץ MP3')),
                            React.createElement("button", { onClick: () => fileInputRef.current.click(), className: "px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 shrink-0 transition" },
                                React.createElement(Upload, { className: "w-3.5 h-3.5 text-cyan-400" }),
                                React.createElement("span", null, "\u05D4\u05E2\u05DC\u05D4")),
                            React.createElement("input", { ref: fileInputRef, type: "file", accept: "audio/*", onChange: handleFileUpload, className: "hidden" })),
                        React.createElement("div", { className: "flex items-center gap-4" },
                            React.createElement("button", { onClick: handleAudioToggle, className: "p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition shrink-0" }, isAudioPlaying ? React.createElement(Pause, { className: "w-5 h-5" }) : React.createElement(Play, { className: "w-5 h-5 rotate-180" })),
                            React.createElement("div", { className: "flex-1 space-y-1" },
                                React.createElement("div", { className: "flex justify-between text-[11px] text-slate-400" },
                                    React.createElement("span", null, "\u05E2\u05D5\u05E6\u05DE\u05EA \u05E9\u05DE\u05E2"),
                                    React.createElement("span", null,
                                        Math.round(volume * 100),
                                        "%")),
                                React.createElement("input", { type: "range", min: "0", max: "1", step: "0.01", value: volume, onChange: (e) => setVolume(parseFloat(e.target.value)), className: "w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-1.5" })))),
                    React.createElement("div", { className: "p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-3" },
                        React.createElement("h4", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400" }, "\u05E1\u05D9\u05DB\u05D5\u05DD \u05E1\u05E9\u05E0\u05D9\u05DD \u05D9\u05D5\u05DE\u05D9"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", { className: "p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80" },
                                React.createElement("span", { className: "text-2xl font-bold text-cyan-400" }, completedSessions),
                                React.createElement("span", { className: "block text-[11px] text-slate-400 mt-0.5" }, "\u05E1\u05E9\u05E0\u05D9\u05DD \u05D4\u05D5\u05E9\u05DC\u05DE\u05D5")),
                            React.createElement("div", { className: "p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80" },
                                React.createElement("span", { className: "text-2xl font-bold text-emerald-400" },
                                    totalAct,
                                    " / ",
                                    totalEst),
                                React.createElement("span", { className: "block text-[11px] text-slate-400 mt-0.5" }, "\u05E4\u05D5\u05DE\u05D5\u05D3\u05D5\u05E8\u05D5 (\u05D1\u05D5\u05E6\u05E2/\u05DE\u05D5\u05E2\u05E8\u05DA)"))))))),
            activeTab === 'tasks' && (React.createElement("div", { className: "max-w-3xl mx-auto w-full space-y-6" },
                React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800" },
                    React.createElement("div", null,
                        React.createElement("h2", { className: "text-xl font-bold text-slate-100" }, "\u05E8\u05E9\u05D9\u05DE\u05EA \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05D5\u05DE\u05D9\u05E7\u05D5\u05D3"),
                        React.createElement("p", { className: "text-xs text-slate-400 mt-1" }, "\u05E0\u05D4\u05DC \u05D5\u05D4\u05E2\u05E8\u05DA \u05D0\u05EA \u05DE\u05E1\u05E4\u05E8 \u05D4\u05E1\u05E9\u05E0\u05D9\u05DD \u05D4\u05E0\u05D3\u05E8\u05E9\u05D9\u05DD \u05DC\u05DB\u05DC \u05DE\u05E9\u05D9\u05DE\u05D4.")),
                    React.createElement("div", { className: "flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs" },
                        React.createElement("button", { onClick: () => setTaskMode('pomo'), className: `px-3 py-1.5 rounded-lg transition ${taskMode === 'pomo' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}` }, "\u05DE\u05E6\u05D1 \u05E1\u05E4\u05D9\u05E8\u05EA \u05E4\u05D5\u05DE\u05D5\u05D3\u05D5\u05E8\u05D5"),
                        React.createElement("button", { onClick: () => setTaskMode('simple'), className: `px-3 py-1.5 rounded-lg transition ${taskMode === 'simple' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}` }, "\u05E8\u05E9\u05D9\u05DE\u05D4 \u05E4\u05E9\u05D5\u05D8\u05D4"))),
                React.createElement("form", { onSubmit: addTask, className: "p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row gap-3 items-center" },
                    React.createElement("input", { type: "text", placeholder: "\u05E2\u05DC \u05DE\u05D4 \u05EA\u05E8\u05E6\u05D4 \u05DC\u05E2\u05D1\u05D5\u05D3 \u05D4\u05D9\u05D5\u05DD?", value: newTaskText, onChange: (e) => setNewTaskText(e.target.value), className: "flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 w-full" }),
                    taskMode === 'pomo' && (React.createElement("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0" },
                        React.createElement("span", { className: "text-xs text-slate-400" }, "\u05E2\u05E8\u05DA \u05E1\u05E9\u05E0\u05D9\u05DD:"),
                        React.createElement("input", { type: "number", min: "1", max: "10", value: newTaskEst, onChange: (e) => setNewTaskEst(e.target.value), className: "w-12 bg-transparent text-cyan-400 font-bold text-sm text-center focus:outline-none" }))),
                    React.createElement("button", { type: "submit", className: "w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5 shrink-0" },
                        React.createElement(Plus, { className: "w-4 h-4" }),
                        React.createElement("span", null, "\u05D4\u05D5\u05E1\u05E3 \u05DE\u05E9\u05D9\u05DE\u05D4"))),
                React.createElement("div", { className: "space-y-3" }, filteredTasks.length === 0 ? (React.createElement("div", { className: "p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-500 text-sm" },
                    "\u05D0\u05D9\u05DF \u05DE\u05E9\u05D9\u05DE\u05D5\u05EA \u05DE\u05EA\u05D5\u05DB\u05E0\u05E0\u05D5\u05EA \u05DC\u05EA\u05D0\u05E8\u05D9\u05DA ",
                    selectedDate,
                    ". \u05E6\u05D5\u05E8 \u05DE\u05E9\u05D9\u05DE\u05D4 \u05D7\u05D3\u05E9\u05D4 \u05DC\u05DE\u05E2\u05DC\u05D4!")) : (filteredTasks.map((task) => (React.createElement("div", { key: task.id, className: `p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${task.completed
                        ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:border-cyan-500/30'}` },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("button", { onClick: () => toggleTask(task.id), className: "text-slate-400 hover:text-cyan-400 transition shrink-0" }, task.completed ? (React.createElement(CheckCircle2, { className: "w-5 h-5 text-emerald-400" })) : (React.createElement(Circle, { className: "w-5 h-5 text-slate-600" }))),
                        React.createElement("span", { className: "text-sm font-medium" }, task.text)),
                    React.createElement("div", { className: "flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end" },
                        taskMode === 'pomo' && (React.createElement("div", { className: "flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800" },
                            React.createElement("span", { className: "text-cyan-400" }, task.actual),
                            React.createElement("span", { className: "text-slate-600" }, "/"),
                            React.createElement("span", { className: "text-slate-400" },
                                task.estimated,
                                " \u05E1\u05E9\u05E0\u05D9\u05DD"))),
                        React.createElement("button", { onClick: () => deleteTask(task.id), className: "text-slate-600 hover:text-rose-400 transition" },
                            React.createElement(Trash2, { className: "w-4 h-4" })))))))))),
            activeTab === 'schedule' && (React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8" },
                React.createElement("div", { className: "lg:col-span-5 space-y-6" },
                    React.createElement("div", { className: "p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between mb-2" },
                            React.createElement("h3", { className: "font-semibold text-slate-200" }, "\u05D1\u05D7\u05D9\u05E8\u05EA \u05EA\u05D0\u05E8\u05D9\u05DA"),
                            React.createElement("input", { type: "date", value: selectedDate, onChange: (e) => {
                                    setSelectedDate(e.target.value);
                                    setEditingHour(null);
                                }, className: "bg-slate-950 text-cyan-400 text-xs px-3 py-1.5 rounded-xl border border-cyan-500/30 focus:outline-none" })),
                        React.createElement("div", { className: "p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2" },
                            React.createElement("span", { className: "text-xs text-slate-400 block" }, "\u05DE\u05E6\u05D9\u05D2 \u05DC\u05D5\"\u05D6 \u05E2\u05D1\u05D5\u05E8:"),
                            React.createElement("span", { className: "text-lg font-mono font-bold text-cyan-300" }, new Date(selectedDate).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })))),
                    React.createElement("div", { className: "p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4" },
                        React.createElement("h3", { className: "font-semibold text-slate-200 text-sm" }, "\u05D4\u05D5\u05E1\u05E3 \u05DE\u05E9\u05D9\u05DE\u05D4 \u05DC\u05E4\u05D9 \u05E9\u05E2\u05D4 \u05D5\u05D3\u05E7\u05D4"),
                        React.createElement("form", { onSubmit: handleAddCustomTimeTask, className: "space-y-3" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-[11px] text-slate-400 mb-1" }, "\u05D1\u05D7\u05E8 \u05E9\u05E2\u05D4 \u05D5\u05D3\u05E7\u05D4:"),
                                React.createElement("input", { type: "time", value: customTime, onChange: (e) => setCustomTime(e.target.value), className: "w-full bg-slate-950 text-cyan-400 text-sm font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500" })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-[11px] text-slate-400 mb-1" }, "\u05EA\u05D9\u05D0\u05D5\u05E8 \u05D4\u05DE\u05E9\u05D9\u05DE\u05D4 / \u05D4\u05E4\u05D2\u05D9\u05E9\u05D4:"),
                                React.createElement("input", { type: "text", placeholder: "\u05DC\u05D3\u05D5\u05D2\u05DE\u05D4: \u05E9\u05D9\u05D7\u05EA \u05E6\u05D5\u05D5\u05EA, \u05E1\u05E7\u05D9\u05E8\u05EA \u05E4\u05E8\u05D5\u05D9\u05E7\u05D8...", value: customTaskText, onChange: (e) => setCustomTaskText(e.target.value), className: "w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500" })),
                            React.createElement("button", { type: "submit", className: "w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/40 hover:bg-cyan-500/30 transition flex items-center justify-center gap-1.5" },
                                React.createElement(Plus, { className: "w-4 h-4" }),
                                React.createElement("span", null, "\u05D4\u05D5\u05E1\u05E3 \u05DC\u05DC\u05D5\"\u05D6"))))),
                React.createElement("div", { className: "lg:col-span-7 p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("h3", { className: "font-semibold text-slate-200" }, "\u05DC\u05D5\u05D7 \u05D6\u05DE\u05E0\u05D9\u05DD \u05D9\u05D5\u05DE\u05D9 (\u05DC\u05D5\"\u05D6)"),
                        React.createElement("span", { className: "text-xs text-slate-400" }, "\u05DC\u05D7\u05E5 \u05E2\u05DC \u05DE\u05E9\u05D1\u05E6\u05EA \u05DB\u05D3\u05D9 \u05DC\u05E2\u05E8\u05D5\u05DA \u05D0\u05D5 \u05DC\u05D4\u05D5\u05E1\u05D9\u05E3")),
                    React.createElement("div", { className: "space-y-3 max-h-[550px] overflow-y-auto pl-2 custom-scrollbar" }, (() => {
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
                            return (React.createElement("div", { key: timeSlot, className: "flex items-center gap-3 p-3 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-cyan-500/30 transition group" },
                                React.createElement("span", { className: "text-xs font-mono text-cyan-400 w-14 shrink-0 font-bold" }, timeSlot),
                                React.createElement("div", { className: "flex-1" }, isEditing ? (React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("input", { type: "text", autoFocus: true, value: editingText, onChange: (e) => setEditingText(e.target.value), onKeyDown: (e) => {
                                            if (e.key === 'Enter')
                                                handleSaveHourlyItem(timeSlot);
                                            if (e.key === 'Escape')
                                                setEditingHour(null);
                                        }, placeholder: "\u05E8\u05E9\u05D5\u05DD \u05DE\u05E9\u05D9\u05DE\u05D4 \u05D0\u05D5 \u05E4\u05D2\u05D9\u05E9\u05D4 \u05DC\u05E9\u05E2\u05D4 \u05D6\u05D5...", className: "flex-1 bg-slate-950 text-xs text-cyan-200 px-3 py-1.5 rounded-xl border border-cyan-500/50 focus:outline-none" }),
                                    React.createElement("button", { onClick: () => handleSaveHourlyItem(timeSlot), className: "p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition", title: "\u05E9\u05DE\u05D5\u05E8" },
                                        React.createElement(Check, { className: "w-4 h-4" })),
                                    React.createElement("button", { onClick: () => setEditingHour(null), className: "p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition", title: "\u05D1\u05D9\u05D8\u05D5\u05DC" },
                                        React.createElement(X, { className: "w-4 h-4" })))) : (React.createElement("div", { onClick: () => handleStartEditHourlyItem(timeSlot, itemContent), className: "cursor-pointer min-h-[32px] flex items-center justify-between" }, itemContent ? (React.createElement("span", { className: "text-xs text-slate-200 font-medium px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 block w-full text-right" }, itemContent)) : (React.createElement("span", { className: "text-xs italic text-slate-600 hover:text-slate-400 transition" },
                                    "+ \u05DC\u05D7\u05E5 \u05DC\u05D4\u05D5\u05E1\u05E4\u05EA \u05DE\u05E9\u05D9\u05DE\u05D4 \u05DC\u05E9\u05E2\u05D4 ",
                                    timeSlot))))),
                                !isEditing && (React.createElement("div", { className: "flex items-center gap-1 opacity-80 group-hover:opacity-100 transition" },
                                    React.createElement("button", { onClick: () => handleStartEditHourlyItem(timeSlot, itemContent), className: "p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 transition", title: "\u05E2\u05E8\u05D5\u05DA" },
                                        React.createElement(Edit2, { className: "w-3.5 h-3.5" })),
                                    itemContent && (React.createElement("button", { onClick: () => handleDeleteHourlyItem(timeSlot), className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition", title: "\u05DE\u05D7\u05E7" },
                                        React.createElement(Trash2, { className: "w-3.5 h-3.5" })))))));
                        });
                    })())))),
            activeTab === 'settings' && (React.createElement("div", { className: "max-w-xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 space-y-6" },
                React.createElement("h2", { className: "text-xl font-bold text-slate-100" }, "\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05D8\u05D9\u05D9\u05DE\u05E8"),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-slate-400 mb-1" }, "\u05DE\u05E9\u05DA \u05E1\u05E9\u05DF \u05DE\u05D9\u05E7\u05D5\u05D3 (\u05D1\u05D3\u05E7\u05D5\u05EA)"),
                        React.createElement("input", { type: "number", min: "1", max: "120", value: workDuration, onChange: (e) => setWorkDuration(Number(e.target.value)), className: "w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-slate-400 mb-1" }, "\u05DE\u05E9\u05DA \u05D4\u05E4\u05E1\u05E7\u05D4 \u05E7\u05E6\u05E8\u05D4 (\u05D1\u05D3\u05E7\u05D5\u05EA)"),
                        React.createElement("input", { type: "number", min: "1", max: "30", value: shortBreakDuration, onChange: (e) => setShortBreakDuration(Number(e.target.value)), className: "w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-slate-400 mb-1" }, "\u05DE\u05E9\u05DA \u05D4\u05E4\u05E1\u05E7\u05D4 \u05D0\u05E8\u05D5\u05DB\u05D4 (\u05D1\u05D3\u05E7\u05D5\u05EA)"),
                        React.createElement("input", { type: "number", min: "1", max: "60", value: longBreakDuration, onChange: (e) => setLongBreakDuration(Number(e.target.value)), className: "w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-xs font-medium text-slate-400 mb-1" }, "\u05EA\u05D3\u05D9\u05E8\u05D5\u05EA \u05D4\u05E4\u05E1\u05E7\u05D4 \u05D0\u05E8\u05D5\u05DB\u05D4 (\u05DE\u05E1\u05E4\u05E8 \u05E1\u05E9\u05E0\u05D9\u05DD)"),
                        React.createElement("input", { type: "number", min: "1", max: "10", value: longBreakInterval, onChange: (e) => setLongBreakInterval(Number(e.target.value)), className: "w-full bg-slate-950 text-cyan-300 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono" }))),
                React.createElement("div", { className: "pt-4 border-t border-slate-800 text-xs text-slate-500" }, "\u05DB\u05DC \u05D4\u05E2\u05D3\u05E4\u05D5\u05EA \u05D4\u05E9\u05D9\u05DE\u05D5\u05E9 \u05E0\u05E9\u05DE\u05E8\u05D5\u05EA \u05D1\u05D0\u05D5\u05E4\u05DF \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9 \u05D1\u05D3\u05E4\u05D3\u05E4\u05DF (LocalStorage).")))),
        React.createElement("footer", { className: "mt-auto border-t border-slate-900 bg-slate-950/80 px-4 py-6" },
            React.createElement("div", { className: "max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" },
                React.createElement("div", { className: "flex items-center gap-6" },
                    React.createElement("button", { onClick: handleLike, className: `flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${hasLiked
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}` },
                        React.createElement(Heart, { className: `w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}` }),
                        React.createElement("span", null, likes)),
                    React.createElement("div", { className: "flex items-center gap-1" }, [1, 2, 3, 4, 5].map((star) => (React.createElement("button", { key: star, onClick: () => setRating(star), className: "text-slate-600 hover:text-amber-400 transition" },
                        React.createElement(Star, { className: `w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : ''}` })))))),
                React.createElement("div", { className: "text-xs text-slate-500 font-mono" },
                    "HoloFocus \u00A9 ",
                    new Date().getFullYear(),
                    " \u2022 \u05DE\u05E2\u05E8\u05DB\u05EA \u05DE\u05D9\u05E7\u05D5\u05D3 \u05D4\u05D5\u05DC\u05D5\u05D2\u05E8\u05E4\u05D9\u05EA")))));
}
