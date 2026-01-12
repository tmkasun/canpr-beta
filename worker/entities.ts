/**
 * Minimal real-world demo: One Durable Object instance per entity (User, ChatBoard, CRSProfile), with Indexes for listing.
 */
import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage, CRSProfile } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
// CHAT BOARD ENTITY: one DO instance per chat board, stores its own messages
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// CRS PROFILE ENTITY: persistent storage for user-calculated scores
export class CRSProfileEntity extends IndexedEntity<CRSProfile> {
  static readonly entityName = "profile";
  static readonly indexName = "profiles";
  static readonly initialState: CRSProfile = {
    id: "",
    label: "New Estimate",
    date: new Date().toISOString(),
    score: 0
  };
  static readonly seedData: CRSProfile[] = [
    {
      id: 'demo-1',
      label: 'Demo Profile (Master\'s)',
      date: new Date(Date.now() - 86400000).toISOString(),
      score: 485
    },
    {
      id: 'demo-2',
      label: 'CEC Target (Goal)',
      date: new Date(Date.now() - 7*86400000).toISOString(),
      score: 536
    }
  ];
}