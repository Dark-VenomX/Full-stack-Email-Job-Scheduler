import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      className={`relative flex h-9 w-[88px] items-center rounded-full transition-colors duration-500
        bg-white/40 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] backdrop-blur-md
        dark:bg-black/40 dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.1)]
      `}
    >
      {/* Background Texts */}
      <div className="absolute inset-0 flex items-center justify-between px-3 text-[9px] font-black tracking-wider text-slate-500 dark:text-slate-400 pointer-events-none">
        <span className={`text-left leading-none transition-all duration-500 ${isDark ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          DARK
        </span>
        <span className={`text-right leading-none transition-all duration-500 ${isDark ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
          LIGHT
        </span>
      </div>

      {/* 3D Knob */}
      <div
        className={`absolute flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          bg-white/80 shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,1)] backdrop-blur-md
          dark:bg-slate-800/80 dark:shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.1)]
          ${isDark ? 'translate-x-[56px]' : 'translate-x-1'}
        `}
      >
        {isDark ? (
          <Moon size={14} className="text-slate-200 stroke-[2.5]" />
        ) : (
          <Sun size={14} className="text-slate-600 stroke-[2.5]" />
        )}
      </div>
    </button>
  );
}
