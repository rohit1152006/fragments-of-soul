export interface Poem {
  id: string;
  title: string;
  content: string;
  author: string;
  date?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  isUserGenerated?: boolean;
  username?: string;
  pen_name?: string;
  email?: string;
}

export type ScreenState = 'splash' | 'feed';

export type TabState = 'feed' | 'create' | 'community';

export interface UserProfile {
  username: string;
  penName: string;
  email?: string;
  bio?: string;
}
