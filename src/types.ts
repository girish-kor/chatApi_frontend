export type Screen = 'welcome' | 'username' | 'searching' | 'chat';

export type Message = {
  id?: string;
  senderId: string;
  content: string;
  timestamp: number;
};

// State for the chat reducer
export type ChatState = {
  screen: Screen;
  username: string;
  userId: string | null;
  roomId: string | null;
  messages: Message[];
  messageInput: string;
  partnerUsername: string;
  error: string;
  isConnected: boolean;
  connectionStatus: string;
};

// Actions for the chat reducer
export type ChatAction =
  | { type: 'SET_SCREEN'; payload: Screen }
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'START_USER_CREATION' }
  | { type: 'USER_CREATED'; payload: { userId: string } }
  | { type: 'START_MATCHMAKING'; payload?: { roomId: string; userId: string } }
  | { type: 'MATCH_FOUND'; payload: { roomId: string } }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_MESSAGE_INPUT'; payload: string }
  | { type: 'SET_PARTNER_USERNAME'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: string }
  | { type: 'SET_IS_CONNECTED'; payload: boolean }
  | { type: 'DISCONNECT' };