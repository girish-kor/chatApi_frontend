import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { apiFetch } from '../services/api';
import { ChatAction, ChatState, Message } from '../types';

const initialState: ChatState = {
  screen: 'welcome',
  username: '',
  userId: null,
  roomId: null,
  messages: [],
  messageInput: '',
  partnerUsername: 'Stranger',
  error: '',
  isConnected: false,
  connectionStatus: '',
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload, connectionStatus: '' };
    case 'SET_USERNAME':
      return { ...state, username: action.payload, error: '' };
    case 'START_USER_CREATION':
      return { ...state, error: '', connectionStatus: 'Creating user...' };
    case 'USER_CREATED':
      return { ...state, userId: action.payload.userId };
    case 'START_MATCHMAKING':
      if (action.payload) {
        // Re-initializing a chat session
        return {
          ...state,
          roomId: action.payload.roomId,
          userId: action.payload.userId,
          screen: 'chat',
          error: '',
          connectionStatus: '',
        };
      }
      return {
        // New matchmaking session
        ...state,
        messages: [],
        roomId: null,
        partnerUsername: 'Stranger',
        error: '',
        isConnected: false,
        screen: 'searching',
        connectionStatus: 'Joining matchmaking...',
      };
    case 'MATCH_FOUND':
      return { ...state, roomId: action.payload.roomId, screen: 'chat' };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_MESSAGE_INPUT':
      return { ...state, messageInput: action.payload };
    case 'SET_PARTNER_USERNAME':
      return { ...state, partnerUsername: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, connectionStatus: '' };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_IS_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'DISCONNECT':
      localStorage.removeItem('userId');
      return { ...initialState, screen: 'welcome' };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { username, messageInput, roomId, userId } = state;

  const pollTimerRef = useRef<number | null>(null);
  const matchmakingTimerRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const messageCache = useRef<Map<string, Message[]>>(new Map());
  const reconnectAttemptsRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);

  // --- Timer Management ---
  const clearTimer = useCallback((ref: MutableRefObject<number | null>) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearTimer(pollTimerRef);
    clearTimer(matchmakingTimerRef);
    clearTimer(reconnectTimerRef);
  }, [clearTimer]);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  // --- Helpers ---
  function normalizeMessages(raw: any[] = []): Message[] {
    return (raw || []).map((m) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      // server sends ISO strings; convert to ms timestamp
      timestamp:
        typeof m.timestamp === 'string' ? Date.parse(m.timestamp) : m.timestamp || Date.now(),
    }));
  }

  // Fetch room state once and update messages + partner username
  const fetchRoom = useCallback(async (rId: string, currentUserId: string) => {
    const data = await apiFetch(`/api/chat/${rId}`);
    const msgs = normalizeMessages(data.messages || []);
    dispatch({ type: 'SET_MESSAGES', payload: msgs });
    messageCache.current.set(rId, msgs);

    const partnerId: string | undefined = (data.participantIds || []).find(
      (id: string) => id !== currentUserId
    );
    if (partnerId) {
      try {
        const partner = await apiFetch(`/api/auth/me`, { headers: { 'X-User-Id': partnerId } });
        if (partner?.username)
          dispatch({ type: 'SET_PARTNER_USERNAME', payload: partner.username });
      } catch (e) {
        // non-fatal
      }
    }
  }, []);

  // Long-polling with exponential backoff
  const pollMessages = useCallback(
    async (rId: string, currentUserId: string) => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        await fetchRoom(rId, currentUserId);
        reconnectAttemptsRef.current = 0;
        dispatch({ type: 'SET_IS_CONNECTED', payload: true });
      } catch (err) {
        reconnectAttemptsRef.current++;
        dispatch({ type: 'SET_IS_CONNECTED', payload: false });
        if (reconnectAttemptsRef.current > 6) {
          dispatch({ type: 'SET_ERROR', payload: 'Connection lost. Please refresh.' });
          clearAllTimers();
        } else {
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 10000);
          clearTimer(reconnectTimerRef);
          reconnectTimerRef.current = window.setTimeout(() => {
            pollMessages(rId, currentUserId);
          }, delay);
        }
      } finally {
        isPollingRef.current = false;
      }
    },
    [fetchRoom, clearAllTimers, clearTimer]
  );

  const startPolling = useCallback(
    (rId: string, currentUserId: string) => {
      clearTimer(pollTimerRef);
      // initial fetch then poll every 2s
      pollMessages(rId, currentUserId).catch(() => {});
      pollTimerRef.current = window.setInterval(() => pollMessages(rId, currentUserId), 2000);
    },
    [pollMessages, clearTimer]
  );

  // --- Matchmaking flow ---
  const startMatchmaking = useCallback(
    async (uid: string) => {
      clearAllTimers();
      dispatch({ type: 'START_MATCHMAKING' });
      try {
        await apiFetch('/api/matchmaking/join', {
          method: 'POST',
          body: JSON.stringify({ userId: uid }),
        });

        // poll status every second
        const check = async () => {
          try {
            const status = await apiFetch(`/api/matchmaking/status/${uid}`);
            if (status?.status === 'MATCHED' && status.roomId) {
              clearTimer(matchmakingTimerRef);
              dispatch({ type: 'MATCH_FOUND', payload: { roomId: status.roomId } });
              dispatch({ type: 'SET_SCREEN', payload: 'chat' });
              // initialize chat and start polling
              await fetchRoom(status.roomId, uid);
              startPolling(status.roomId, uid);
            }
          } catch (e) {
            // ignore transient errors
          }
        };

        check();
        matchmakingTimerRef.current = window.setInterval(check, 1000);
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to join matchmaking.' });
      }
    },
    [clearAllTimers, fetchRoom, startPolling, clearTimer]
  );

  // --- Initialization / auth ---
  const initializeApp = useCallback(async () => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) return;
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'Restoring session...' });
    try {
      const user = await apiFetch('/api/auth/me', { headers: { 'X-User-Id': storedUserId } });
      if (user) {
        if (user.username) dispatch({ type: 'SET_USERNAME', payload: user.username });
        dispatch({ type: 'USER_CREATED', payload: { userId: user.id } });
        // If matched already, jump into chat
        if (user.matchStatus === 'MATCHED' && user.roomId) {
          dispatch({
            type: 'START_MATCHMAKING',
            payload: { roomId: user.roomId, userId: user.id },
          });
          dispatch({ type: 'SET_SCREEN', payload: 'chat' });
          await fetchRoom(user.roomId, user.id);
          startPolling(user.roomId, user.id);
        } else {
          // Show username screen so user can re-join
          dispatch({ type: 'SET_SCREEN', payload: 'username' });
        }
      }
    } catch (err) {
      localStorage.removeItem('userId');
      dispatch({ type: 'SET_SCREEN', payload: 'welcome' });
    } finally {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: '' });
    }
  }, [fetchRoom, startPolling]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // --- Actions Exposed to UI ---
  const createUser = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) return dispatch({ type: 'SET_ERROR', payload: 'Please enter a username!' });
    dispatch({ type: 'START_USER_CREATION' });
    try {
      const data = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username: trimmed }),
      });
      if (!data?.id) throw new Error('Invalid server response');
      localStorage.setItem('userId', data.id);
      dispatch({ type: 'USER_CREATED', payload: { userId: data.id } });
      // begin matchmaking
      await startMatchmaking(data.id);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to create user.' });
    }
  }, [username, startMatchmaking]);

  const sendMessage = useCallback(async () => {
    const content = messageInput.trim();
    if (!content || !roomId || !userId) return;
    dispatch({ type: 'SET_MESSAGE_INPUT', payload: '' });
    const optimistic: Message = { senderId: userId, content, timestamp: Date.now() };
    dispatch({ type: 'SET_MESSAGES', payload: [...state.messages, optimistic] });
    try {
      await apiFetch(`/api/chat/${roomId}/send`, {
        method: 'POST',
        body: JSON.stringify({ senderId: userId, content }),
      });
      // fetch latest after send
      await fetchRoom(roomId, userId);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message.' });
      // revert
      dispatch({ type: 'SET_MESSAGES', payload: state.messages });
    }
  }, [messageInput, roomId, userId, state.messages, fetchRoom]);

  const actions = {
    startUsernameEntry: () => dispatch({ type: 'SET_SCREEN', payload: 'username' }),
    setUsername: (u: string) => dispatch({ type: 'SET_USERNAME', payload: u }),
    createUser,
    sendMessage,
    // Attempt to retry connecting to the server / restoring session
    retryConnection: async () => {
      dispatch({ type: 'SET_ERROR', payload: '' });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'Retrying connection...' });
      try {
        await initializeApp();
      } catch (e) {
        dispatch({ type: 'SET_ERROR', payload: (e as any)?.message || 'Retry failed' });
      } finally {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: '' });
      }
    },
    setMessageInput: (m: string) => dispatch({ type: 'SET_MESSAGE_INPUT', payload: m }),
    nextChat: () => {
      if (userId) startMatchmaking(userId);
    },
    disconnect: () => {
      clearAllTimers();
      localStorage.removeItem('userId');
      dispatch({ type: 'DISCONNECT' });
    },
  };

  return { state, actions };
}
