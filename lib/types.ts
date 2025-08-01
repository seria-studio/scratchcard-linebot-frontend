// LIFF Type declarations
declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>;
      ready: Promise<void>;
      isLoggedIn: () => boolean;
      login: () => void;
      logout: () => void;
      getAccessToken: () => string;
      getProfile: () => Promise<{
        userId: string;
        displayName: string;
        pictureUrl: string;
      }>;
    };
  }
}

export interface APIResponse<T> {
  data: T;
  message: string;
}

export interface BaseModel {
  created_at: string;
  updated_at: string;
}

export interface User extends BaseModel {
  id: string;
  is_admin: boolean;
  display_name: string | null;
  scratch_results: ScratchResult[];
}

export interface Prize extends BaseModel {
  id: string;
  text: string;
  image: string | null;
  quantity: number;
  probability: number;
  scratch_card_id?: string;
  results: ScratchResult[];
}

export interface ScratchCard extends BaseModel {
  id: string;
  name: string;
  prizes: Prize[];
  results: ScratchResult[];
}

export interface ScratchResult extends BaseModel {
  id: string;
  user_id: string;
  scratch_card_id: string;
  prize_id: string;
  user: User;
  scratch_card: ScratchCard;
  prize: Prize;
}
