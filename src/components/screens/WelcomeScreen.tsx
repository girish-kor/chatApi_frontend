import React from 'react';
import { XpButton } from '../ui/XpButton';
import { PlayIcon } from '../icons';

export const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center pt-10">
    <h1 className="text-4xl text-[#003d99] font-['Franklin_Gothic_Medium',_sans-serif] mb-5 drop-shadow-md">
      Welcome to ChatXP
    </h1>
    <div className="bg-white border-2 border-gray-400 p-8 mb-8 rounded-md shadow-inner">
      <p className="text-sm mb-4 text-black flex items-center justify-center gap-2">
        <PlayIcon className="w-4 h-4 inline-block" /> Connect with random strangers from
        around the world!
      </p>
      <p className="text-xs text-gray-600">Anonymous • Safe • Fun</p>
    </div>
    <XpButton onClick={onStart}>Start Chatting</XpButton>
  </div>
);
