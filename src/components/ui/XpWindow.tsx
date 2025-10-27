import React from 'react';
import {
  CommentsIcon,
  WindowMaximizeIcon,
  WindowMinimizeIcon,
  TimesIcon,
  WindowRestoreIcon,
} from '../icons';

interface XpWindowProps {
  title: string;
  isMaximized: boolean;
  isHidden: boolean;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  statusBarContent: React.ReactNode;
  children: React.ReactNode;
}

export const XpWindow: React.FC<XpWindowProps> = ({
  title,
  isMaximized,
  isHidden,
  onClose,
  onMaximize,
  onMinimize,
  statusBarContent,
  children,
}) => {
  const windowClasses = isMaximized
    ? 'fixed top-0 left-0 w-screen h-[calc(100vh-40px)] rounded-none shadow-none'
    : 'relative w-[90%] max-w-4xl shadow-[2px_2px_8px_rgba(0,0,0,0.4)] rounded-lg';

  return (
    <main
      className={`${
        isHidden ? 'hidden' : 'flex'
      } flex-col bg-[#ece9d8] overflow-hidden ${windowClasses}`}
      style={
        isMaximized
          ? {}
          : {
              border: '1px solid #08316B',
              boxShadow:
                'inset 0 0 0 3px #0055E7, inset 0 0 0 4px #73A5F7, 2px 2px 8px rgba(0,0,0,0.4)',
            }
      }
    >
      {/* Title Bar */}
      <header className="bg-gradient-to-b from-[#0055E7] via-[#004ABF] to-[#003ED1] p-0.5 pl-2 pr-1 flex items-center gap-1.5 rounded-t select-none">
        <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[3px] flex items-center justify-center border border-orange-700 text-white">
          <CommentsIcon className="w-3 h-3" />
        </div>
        <h2 className="text-white text-xs font-bold tracking-wider drop-shadow-sm flex-grow">
          {title}
        </h2>
        <div className="flex gap-0.5">
          <button
            onClick={onMinimize}
            className="w-6 h-5 flex items-center justify-center border rounded-sm focus:outline-none bg-gradient-to-b from-[#60A2F7] to-[#0055E7] border-t-[#87B2F7] border-l-[#87B2F7] border-b-[#062B6F] border-r-[#062B6F] text-white font-bold"
          >
            <WindowMinimizeIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMaximize}
            className="w-6 h-5 flex items-center justify-center border rounded-sm focus:outline-none bg-gradient-to-b from-[#60A2F7] to-[#0055E7] border-t-[#87B2F7] border-l-[#87B2F7] border-b-[#062B6F] border-r-[#062B6F] text-white font-bold"
          >
            {isMaximized ? (
              <WindowRestoreIcon className="w-4 h-4" />
            ) : (
              <WindowMaximizeIcon className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="w-6 h-5 flex items-center justify-center border rounded-sm focus:outline-none bg-gradient-to-b from-[#F79360] to-[#E74600] border-t-[#F7B987] border-l-[#F7B987] border-b-[#6F1D06] border-r-[#6F1D06] text-white font-bold"
          >
            <TimesIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Content Area */}
      <section className="flex-1 p-5 overflow-y-auto">{children}</section>

      {/* Status Bar */}
      <footer className="bg-gradient-to-b from-[#f1efe2] to-[#d8d5c7] border-t border-white px-2 py-0.5 text-xs flex gap-2.5 items-center">
        {statusBarContent}
      </footer>
    </main>
  );
};
