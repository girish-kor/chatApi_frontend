import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import { XpButton } from '../ui/XpButton';
import { CommentsIcon, EnterIcon, ExitIcon } from '../icons';

interface ChatScreenProps {
  messages: Message[];
  messageInput: string;
  setMessageInput: (m: string) => void;
  sendMessage: () => void;
  nextChat: () => void;
  disconnect: () => void;
  userId: string | null;
  partnerUsername: string;
  isConnected: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  nextChat,
  disconnect,
  userId,
  partnerUsername,
  isConnected,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div>
      <div className="bg-gradient-to-b from-[#0997ff] to-[#0053ee] text-white px-3 py-2 mb-3 flex justify-between items-center rounded-md border border-[#003c74]">
        <span className="text-xs font-bold flex items-center gap-2">
          <CommentsIcon className="w-4 h-4" /> Chatting with: {partnerUsername}
          {!isConnected && ' (reconnecting...)'}
        </span>
        <div className="flex gap-1.5">
          <XpButton onClick={nextChat} className="px-4 py-1 text-xs">
            <span className="flex items-center gap-2">
              <EnterIcon className="w-4 h-4" /> Next
            </span>
          </XpButton>
          <XpButton onClick={disconnect} className="px-4 py-1 text-xs">
            <span className="flex items-center gap-2">
              <ExitIcon className="w-4 h-4" /> Exit
            </span>
          </XpButton>
        </div>
      </div>

      <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 h-96 overflow-y-auto p-3 mb-3 rounded-md">
        {messages.length === 0 && (
          <p className="text-gray-500 italic text-xs">No messages yet. Say hello!</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={msg.id || `${msg.senderId}-${msg.timestamp}-${idx}`}
            className={`mb-2.5 p-2.5 border border-gray-400 rounded-lg shadow-[1px_1px_2px_rgba(0,0,0,0.1)] ${
              msg.senderId === userId
                ? 'bg-gradient-to-b from-[#d4e8ff] to-[#c0dfff]'
                : 'bg-gradient-to-b from-[#e8f5e9] to-[#d0f0d3]'
            }`}
          >
            <div className="font-bold text-[#003d99] mb-1 text-xs">
              {msg.senderId === userId ? 'You' : partnerUsername}:
            </div>
            <div className="text-sm text-black break-words">{msg.content}</div>
            <div className="text-xs text-gray-600 mt-1 text-right">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={!isConnected}
          className="flex-1 px-2.5 py-2 font-['Tahoma',_sans-serif] text-sm xp-input text-black"
        />
        <XpButton
          onClick={sendMessage}
          disabled={!messageInput.trim() || !isConnected}
          className="px-6 py-2 text-sm"
        >
          Send
        </XpButton>
      </div>
    </div>
  );
};
