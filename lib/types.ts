export interface APIResponse<T> {
  data: T;
  message: string;
}

export interface Prize {
  id: string;
  text: string;
  image: string | null;
  quantity: number;
  probability: number;
  results?: ScratchResult[];
}

export interface ScratchCard {
  id: string;
  name: string;
  prizes: Prize[];
}

export interface ScratchResult {
  id: string;
  user_id: string;
  scratch_card_id: string;
  prize: Prize;
  created_at: string;
}
