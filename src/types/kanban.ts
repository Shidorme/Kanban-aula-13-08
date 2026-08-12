export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
  dueDate: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cardIds: string[];
}

export interface BoardData {
  boardId: string;
  columns: Column[];
  cards: Record<string, Card>;
}

export type SyncStatus = 'saved' | 'saving' | 'error';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}
