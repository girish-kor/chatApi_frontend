import React from 'react';
import { SyncAltIcon } from '../icons';

export const SearchingScreen: React.FC = () => (
  <div className="text-center pt-16">
    <div className="text-6xl mb-8 animate-spin mx-auto flex items-center justify-center text-gray-700">
      <SyncAltIcon aria-hidden="true" />
    </div>
    <h2 className="text-[#003d99] mb-5 text-xl font-bold">
      Searching for a stranger...
    </h2>
    <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 p-5 inline-block rounded-md">
      <div
        className="w-72 h-5 p-0.5 rounded-sm overflow-hidden"
        style={{ border: '1px solid #003C74' }}
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #3299FF 0, #3299FF 10px, transparent 10px, transparent 20px)',
            backgroundSize: '40px 100%',
            animation: 'progress-xp 1s linear infinite',
          }}
        />
      </div>
      <p className="mt-4 text-xs text-black">Connecting...</p>
    </div>
  </div>
);
