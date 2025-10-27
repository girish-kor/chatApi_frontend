import { useState } from 'react';
import { useChat } from './hooks/useChat';

import { ChatScreen } from './components/screens/ChatScreen';
import { SearchingScreen } from './components/screens/SearchingScreen';
import { UsernameScreen } from './components/screens/UsernameScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';

import { UserIcon } from './components/icons';
import { XpTaskbar } from './components/ui/XpTaskbar';
import { XpWindow } from './components/ui/XpWindow';

export default function App() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { state, actions } = useChat();
  const {
    screen,
    username,
    messages,
    messageInput,
    partnerUsername,
    isConnected,
    roomId,
    error,
    connectionStatus,
    userId,
  } = state;

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onStart={actions.startUsernameEntry} />;
      case 'username':
        return (
          <UsernameScreen
            username={username}
            onUsernameChange={actions.setUsername}
            onSubmit={actions.createUser}
          />
        );
      case 'searching':
        return <SearchingScreen />;
      case 'chat':
        return (
          <ChatScreen
            messages={messages}
            messageInput={messageInput}
            setMessageInput={actions.setMessageInput}
            sendMessage={actions.sendMessage}
            nextChat={actions.nextChat}
            disconnect={actions.disconnect}
            userId={userId}
            partnerUsername={partnerUsername}
            isConnected={isConnected}
          />
        );
      default:
        return null;
    }
  };

  const statusBarContent = (
    <>
      <div className="border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2.5 py-0.5 min-w-[150px] flex items-center gap-2">
        <UserIcon className="w-4 h-4" /> {username || 'Not connected'}
      </div>
      <div className="border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2.5 py-0.5 min-w-[120px]">
        {roomId ? (
          isConnected ? (
            <span className="text-green-600">🟢 Connected</span>
          ) : (
            <span className="text-yellow-600">🟡 Reconnecting</span>
          )
        ) : (
          <span className="text-red-600">🔴 Disconnected</span>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen font-['Tahoma',_'Segoe_UI',_sans-serif] p-0 flex justify-center items-center relative overflow-hidden bg-xp-bliss">
      <XpWindow
        title="ChatXP - Connect with Strangers"
        isHidden={isHidden}
        isMaximized={isMaximized}
        onClose={screen === 'chat' ? actions.disconnect : () => setIsHidden(true)}
        onMaximize={() => setIsMaximized((s) => !s)}
        onMinimize={() => setIsHidden(true)}
        statusBarContent={statusBarContent}
      >
        {(connectionStatus || error) && (
          <div
            className={`p-3 mb-4 rounded-md text-xs border-2 shadow-sm ${
              error
                ? 'bg-gradient-to-b from-red-400 to-red-600 text-white border-red-800'
                : 'bg-gradient-to-b from-yellow-200 to-yellow-300 text-black border-yellow-500'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 truncate">
                {error ? `⚠️ ${error}` : `⏳ ${connectionStatus}`}
              </div>
              {error && (
                <button
                  onClick={() => (actions as any).retryConnection?.()}
                  className="ml-3 px-2 py-1 text-xs rounded bg-white text-black border"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
        {renderScreen()}
      </XpWindow>

      <XpTaskbar appName="ChatXP" isHidden={isHidden} onShow={() => setIsHidden(false)} />
    </div>
  );
}
