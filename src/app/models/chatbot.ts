export interface ChatResponse {
  reply: string;
  date?: Date;
}

export interface ChatRequest {
  message: string;
  date?: Date;
}

export interface ChatMessage {
  message: string;
  sender: 'user' | 'bot';
  date?: Date;
}
