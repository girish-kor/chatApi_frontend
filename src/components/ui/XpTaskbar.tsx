import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CommentDotsIcon,
  SignalIcon,
  VolumeUpIcon,
  WindowsLogo,
} from '../icons';

interface XpTaskbarProps {
  appName: string;
  isHidden: boolean;
  onShow: () => void;
}

export const XpTaskbar: React.FC<XpTaskbarProps> = ({ appName, isHidden, onShow }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => setTime(new Date()), 1000 * 30); // Update time every 30s
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <nav className="fixed left-0 right-0 bottom-0 h-10 bg-gradient-to-b from-[#245edb] to-[#1941a5] border-t-2 border-[#1e3f98] flex items-center px-2 gap-2 z-50 shadow-inner">
      {/* Start Button */}
      <a
        href="https://github.com/aistudio-co/prototyping-sdks"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-gradient-to-b from-[#7bd14b] to-[#49a221] border border-[#2f7a18] rounded-l-md rounded-r-2xl px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),1px_2px_4px_rgba(0,0,0,0.2)] text-white no-underline"
      >
        <div className="w-5 h-5 rounded-full bg-radial-gradient-bl from-[#d7ffb8] via-[#7bd14b] to-[#49a221] flex items-center justify-center shadow-inner">
          <WindowsLogo className="w-3 h-3" />
        </div>
        <span className="font-bold text-sm text-shadow-[0_1px_0_rgba(0,0,0,0.25)]">Start</span>
      </a>
      <div className="w-0.5 h-7 bg-gradient-to-b from-[#1941a5] to-[#0d2b6b] mx-1" />

      {/* Application Button */}
      <button
        onClick={onShow}
        className={`flex items-center gap-1.5 px-3 py-1 border border-white/30 rounded-md text-white font-bold text-xs max-w-40 ${
          isHidden
            ? 'bg-gradient-to-b from-[#3169c6] to-[#1e4ba1]'
            : 'bg-gradient-to-b from-[#1e4ba1] to-[#13357a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]'
        }`}
      >
        <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-sm flex items-center justify-center border border-orange-700">
          <CommentDotsIcon className="w-2.5 h-2.5" />
        </div>
        <span className="truncate">{appName}</span>
      </button>
      <div className="flex-grow" />

      {/* System Tray */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gradient-to-b from-[#0d8edb] to-[#0955a1] border border-black/30 rounded-md text-white">
        <VolumeUpIcon className="w-4 h-4 cursor-pointer" title="Volume" />
        <SignalIcon className="w-4 h-4 cursor-pointer" title="Network" />
        <div className="w-px h-5 bg-white/20 mx-1" />
        <div className="text-xs min-w-[70px] text-center flex items-center gap-1.5">
          <ClockIcon className="w-3 h-3" />
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </nav>
  );
};
