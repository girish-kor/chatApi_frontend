import React from 'react';
import { XpButton } from '../ui/XpButton';
import { UserIcon } from '../icons';

interface UsernameScreenProps {
  username: string;
  onUsernameChange: (u: string) => void;
  onSubmit: () => void;
}

export const UsernameScreen: React.FC<UsernameScreenProps> = ({
  username,
  onUsernameChange,
  onSubmit,
}) => (
  <div className="max-w-sm mx-auto pt-10 text-center">
    <fieldset className="border border-gray-400 rounded-md p-6 pt-3 text-left relative shadow-inner bg-white/50">
      <legend className="px-2 text-sm font-bold text-[#003d99] ml-2">
        Enter Your Username
      </legend>
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-b from-blue-400 to-blue-600 p-2 rounded-md shadow-md">
          <UserIcon className="w-10 h-10 text-white" />
        </div>
        <div className="flex-grow">
          <label htmlFor="username-input" className="block mb-1 text-xs">
            Username:
          </label>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
            maxLength={20}
            className="w-full px-2 py-1.5 font-['Tahoma',_sans-serif] text-sm xp-input text-black"
            autoFocus
          />
        </div>
      </div>
    </fieldset>
    <div className="mt-6">
      <XpButton onClick={onSubmit} disabled={!username.trim()}>
        Connect
      </XpButton>
    </div>
  </div>
);