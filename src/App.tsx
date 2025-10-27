import { useEffect, useRef, useState } from 'react';

export default function App() {
  // Use local proxy in development (Vite) to avoid CORS; use real host in production
  const API_BASE = import.meta.env.DEV ? '/api' : 'https://chatapi.miniproject.in/api';
  const [screen, setScreen] = useState('welcome');
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [messages, setMessages] = useState<
    Array<{ senderId: string; content: string; timestamp: string }>
  >([]);
  const [messageInput, setMessageInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const chatPollingInterval = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // safeFetch: wraps fetch and returns parsed JSON or null on error
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        console.warn(`Fetch failed: ${url} (status ${res.status})`);
        return null;
      }
      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Network error fetching ${url}: ${msg}`);
      return null;
    }
  };

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('chatxp_userId');
    const storedUsername = sessionStorage.getItem('chatxp_username');

    if (storedUserId && storedUsername) {
      setUserId(storedUserId);
      setUsername(storedUsername);
      checkUserStatus(storedUserId);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (chatPollingInterval.current) clearInterval(chatPollingInterval.current);
    };
  }, []);

  const checkUserStatus = async (uid: string) => {
  const data = await safeFetch(`${API_BASE}/auth/me`, {
      headers: { 'X-User-Id': uid },
    });

    if (!data) {
      // Couldn't reach server; keep user but show disconnected
      setConnectionStatus('Disconnected');
      return;
    }

    if (data.username !== 'anonymous') {
      setUsername(data.username);
      if (data.matchStatus === 'MATCHED' && data.roomId) {
        setRoomId(data.roomId);
        await loadChatRoom(data.roomId, uid);
        setScreen('chat');
        setConnectionStatus('Connected');
      } else if (data.matchStatus === 'WAITING') {
        setScreen('searching');
        startMatchmaking(uid);
      }
    }
  };

  const handleStartChat = () => {
    setScreen('username');
  };

  const handleConnect = async () => {
    if (!inputUsername.trim()) {
      return;
    }
  const data = await safeFetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: inputUsername.trim() }),
    });

    if (!data) {
      setConnectionStatus('Disconnected');
      return;
    }
    setUserId(data.id);
    setUsername(data.username);
    sessionStorage.setItem('chatxp_userId', data.id);
    sessionStorage.setItem('chatxp_username', data.username);

    setScreen('searching');
    startMatchmaking(data.id);
  };

  const startMatchmaking = async (uid: string) => {
  const res = await safeFetch(`${API_BASE}/matchmaking/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid }),
    });

    if (!res) {
      setConnectionStatus('Disconnected');
      return;
    }

    pollMatchStatus(uid);
  };

  const pollMatchStatus = (uid: string) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
  const data = await safeFetch(`${API_BASE}/matchmaking/status/${uid}`);
      if (!data) return; // keep polling until server reachable

      if (data.status === 'MATCHED' && data.roomId) {
        clearInterval(pollingInterval.current!);
        setRoomId(data.roomId);
        await loadChatRoom(data.roomId, uid);
        setScreen('chat');
        setConnectionStatus('Connected');
      }
    }, 2000);
  };

  const loadChatRoom = async (room: string, uid: string) => {
  const data = await safeFetch(`${API_BASE}/chat/${room}`);
    if (!data) {
      setConnectionStatus('Disconnected');
      return;
    }

    if (data.participantIds && data.participantIds.length > 0) {
      const partnerId = data.participantIds.find((id: string) => id !== uid);
      if (partnerId) {
  const partnerData = await safeFetch(`${API_BASE}/auth/me`, {
          headers: { 'X-User-Id': partnerId },
        });
        setPartnerName((partnerData && partnerData.username) || 'Stranger');
      }
    }

    setMessages(data.messages || []);
    startChatPolling(room);
  };

  const startChatPolling = (room: string) => {
    if (chatPollingInterval.current) clearInterval(chatPollingInterval.current);

    chatPollingInterval.current = setInterval(async () => {
  const data = await safeFetch(`${API_BASE}/chat/${room}`);
      if (!data) return;
      setMessages(data.messages || []);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !roomId || !userId) return;

  const res = await safeFetch(`${API_BASE}/chat/${roomId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userId,
        content: messageInput.trim(),
      }),
    });

    if (!res) {
      setConnectionStatus('Disconnected');
      return;
    }

    setMessageInput('');
  };

  const handleNext = () => {
    if (chatPollingInterval.current) clearInterval(chatPollingInterval.current);
    setMessages([]);
    setRoomId(null);
    setPartnerName('');
    setScreen('searching');
    startMatchmaking(userId!);
  };

  const handleExit = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    if (chatPollingInterval.current) clearInterval(chatPollingInterval.current);
    sessionStorage.removeItem('chatxp_userId');
    sessionStorage.removeItem('chatxp_username');
    setScreen('welcome');
    setUserId(null);
    setUsername('');
    setRoomId(null);
    setMessages([]);
    setConnectionStatus('Disconnected');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="min-h-screen font-['Tahoma',_'Segoe_UI',_sans-serif] p-0 flex justify-center items-center relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <main
        className="relative w-[90%] max-w-4xl shadow-[2px_2px_8px_rgba(0,0,0,0.4)] rounded-lg flex flex-col bg-[#ece9d8] overflow-hidden"
        style={{
          border: '1px solid #08316B',
          boxShadow:
            'inset 0 0 0 3px #0055E7, inset 0 0 0 4px #73A5F7, 2px 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {/* Title Bar */}
        <header className="bg-gradient-to-b from-[#0055E7] via-[#004ABF] to-[#003ED1] p-0.5 pl-2 pr-1 flex items-center gap-1.5 rounded-t select-none">
          <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[3px] flex items-center justify-center border border-orange-700 text-white">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
            </svg>
          </div>
          <h2 className="text-white text-xs font-bold tracking-wider drop-shadow-sm flex-grow">
            ChatXP - Connect with Strangers
          </h2>
          <div className="flex gap-0.5">
            <button className="w-6 h-5 flex items-center justify-center border rounded-sm bg-gradient-to-b from-[#60A2F7] to-[#0055E7] border-t-[#87B2F7] border-l-[#87B2F7] border-b-[#062B6F] border-r-[#062B6F] text-white">
              <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M2 8h8v2H2z" />
              </svg>
            </button>
            <button className="w-6 h-5 flex items-center justify-center border rounded-sm bg-gradient-to-b from-[#60A2F7] to-[#0055E7] border-t-[#87B2F7] border-l-[#87B2F7] border-b-[#062B6F] border-r-[#062B6F] text-white">
              <svg
                viewBox="0 0 12 12"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 2h8v8H2z" />
              </svg>
            </button>
            <button className="w-6 h-5 flex items-center justify-center border rounded-sm bg-gradient-to-b from-[#F79360] to-[#E74600] border-t-[#F7B987] border-l-[#F7B987] border-b-[#6F1D06] border-r-[#6F1D06] text-white">
              <svg
                viewBox="0 0 12 12"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M3 3l6 6m0-6l-6 6" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content area */}
        <section className="flex-1 p-5 overflow-y-auto">
          {screen === 'welcome' && (
            <div className="text-center pt-10">
              <h1 className="text-4xl text-[#003d99] font-['Franklin_Gothic_Medium',_sans-serif] mb-5 drop-shadow-md">
                Welcome to ChatXP
              </h1>
              <div className="bg-white border-2 border-gray-400 p-8 mb-8 rounded-md shadow-inner inline-block">
                <p className="text-sm mb-4 text-black flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Connect with random strangers from around the world!
                </p>
                <p className="text-xs text-gray-600">Anonymous • Safe • Fun</p>
              </div>
              <button
                onClick={handleStartChat}
                className="px-6 py-1.5 text-xs font-bold border rounded-[3px] bg-gradient-to-b from-[#ece9d8] to-[#d1cdbf] border-[#003c74] text-black shadow-[1px_1px_3px_rgba(0,0,0,0.2)] hover:from-[#f5f3e8] active:from-[#d1cdbf]"
              >
                Start Chatting
              </button>
            </div>
          )}

          {screen === 'username' && (
            <div className="max-w-sm mx-auto pt-10 text-center">
              <fieldset className="border border-gray-400 rounded-md p-6 pt-3 text-left relative shadow-inner bg-white/50">
                <legend className="px-2 text-sm font-bold text-[#003d99] ml-2">
                  Enter Your Username
                </legend>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-b from-blue-400 to-blue-600 p-2 rounded-md shadow-md">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <label htmlFor="username-input" className="block mb-1 text-xs">
                      Username:
                    </label>
                    <input
                      id="username-input"
                      type="text"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                      maxLength={20}
                      placeholder="Enter username..."
                      className="w-full px-2 py-1.5 font-['Tahoma',_sans-serif] text-sm border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white rounded-sm text-black"
                    />
                  </div>
                </div>
              </fieldset>
              <div className="mt-6">
                <button
                  onClick={handleConnect}
                  className="px-6 py-1.5 text-xs font-bold border rounded-[3px] bg-gradient-to-b from-[#ece9d8] to-[#d1cdbf] border-[#003c74] text-black shadow-[1px_1px_3px_rgba(0,0,0,0.2)] hover:from-[#f5f3e8] active:from-[#d1cdbf]"
                >
                  Connect
                </button>
              </div>
            </div>
          )}

          {screen === 'searching' && (
            <div className="text-center pt-16">
              <div className="text-6xl mb-8 animate-spin mx-auto flex items-center justify-center text-gray-700">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
              </div>
              <h2 className="text-[#003d99] mb-5 text-xl font-bold">Searching for a stranger...</h2>
              <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 p-5 inline-block rounded-md">
                <div className="w-72 h-5 p-0.5 rounded-sm overflow-hidden border border-[#003C74]">
                  <div
                    className="h-full w-full animate-pulse"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #3299FF 0, #3299FF 10px, transparent 10px, transparent 20px)',
                      backgroundSize: '40px 100%',
                    }}
                  />
                </div>
                <p className="mt-4 text-xs text-black">Connecting...</p>
              </div>
            </div>
          )}

          {screen === 'chat' && (
            <div>
              <div className="bg-gradient-to-b from-[#0997ff] to-[#0053ee] text-white px-3 py-2 mb-3 flex justify-between items-center rounded-md border border-[#003c74]">
                <span className="text-xs font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                  </svg>
                  Chatting with: {partnerName}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleNext}
                    className="px-4 py-1 text-xs bg-gradient-to-b from-[#ece9d8] to-[#d1cdbf] border border-[#003c74] text-black font-bold rounded-[3px] hover:from-[#f5f3e8]"
                  >
                    Next
                  </button>
                  <button
                    onClick={handleExit}
                    className="px-4 py-1 text-xs bg-gradient-to-b from-[#ff6b6b] to-[#e03c3c] border border-[#8b0000] text-white rounded-[3px] font-bold hover:from-[#ff8080]"
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 h-96 overflow-y-auto p-3 mb-3 rounded-md">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 italic text-sm pt-8">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-2.5 p-2.5 border border-gray-400 rounded-lg shadow-[1px_1px_2px_rgba(0,0,0,0.1)] ${
                        msg.senderId === userId
                          ? 'bg-gradient-to-b from-[#d4e8ff] to-[#c0dfff]'
                          : 'bg-gradient-to-b from-[#e8f5e9] to-[#d0f0d3]'
                      }`}
                    >
                      <div className="font-bold text-[#003d99] mb-1 text-xs">
                        {msg.senderId === userId ? 'YOU' : partnerName.toUpperCase()}:
                      </div>
                      <div className="text-sm text-black break-words">{msg.content}</div>
                      <div className="text-xs text-gray-600 mt-1 text-right">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-2.5 py-2 font-['Tahoma',_sans-serif] text-sm border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white rounded-sm text-black"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 text-sm bg-gradient-to-b from-[#ece9d8] to-[#d1cdbf] border border-[#003c74] font-bold rounded-[3px] hover:from-[#f5f3e8] active:from-[#d1cdbf]"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Status Bar */}
        <footer className="bg-gradient-to-b from-[#f1efe2] to-[#d8d5c7] border-t border-white px-2 py-0.5 text-xs flex gap-2.5 items-center">
          <div className="border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2.5 py-0.5 min-w-[150px] flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>{username || 'Guest'}</span>
          </div>
          <div className="border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2.5 py-0.5 min-w-[120px]">
            <span className={connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>
              {connectionStatus === 'Connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </footer>
      </main>

      {/* Taskbar */}
      <nav className="fixed left-0 right-0 bottom-0 h-10 bg-gradient-to-b from-[#245edb] to-[#1941a5] border-t-2 border-[#1e3f98] flex items-center px-2 gap-2 z-50 shadow-inner">
        <button className="flex items-center gap-2 bg-gradient-to-b from-[#7bd14b] to-[#49a221] border border-[#2f7a18] rounded-l-md rounded-r-2xl px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),1px_2px_4px_rgba(0,0,0,0.2)] text-white">
          <div className="w-5 h-5 rounded-full bg-gradient-radial from-[#d7ffb8] via-[#7bd14b] to-[#49a221] flex items-center justify-center shadow-inner">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="3" width="10" height="8" fill="#fff" opacity="0.95" />
              <rect x="13" y="3" width="10" height="8" fill="#fff" opacity="0.95" />
              <rect x="1" y="13" width="10" height="8" fill="#fff" opacity="0.95" />
              <rect x="13" y="13" width="10" height="8" fill="#fff" opacity="0.95" />
            </svg>
          </div>
          <span className="font-bold text-sm">Start</span>
        </button>
        <div className="w-0.5 h-7 bg-gradient-to-b from-[#1941a5] to-[#0d2b6b] mx-1" />
        <div className="flex items-center gap-1.5 px-3 py-1 border border-white/30 rounded-md text-white font-bold text-xs bg-gradient-to-b from-[#3169c6] to-[#1e4ba1]">
          <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-sm flex items-center justify-center border border-orange-700">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
            </svg>
          </div>
          <span className="truncate">ChatXP</span>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-2 px-2 py-1 bg-gradient-to-b from-[#0d8edb] to-[#0955a1] border border-black/30 rounded-md text-white">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
          </svg>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21l-8-9c2.8-2.13 6.2-3.5 10-3.5s7.2 1.37 10 3.5l-8 9z" />
          </svg>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <div className="text-xs min-w-[70px] text-center flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span>
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
