export interface HCPCreateInput {
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  email: string;
  phone: string;
}

export interface HCPResponse {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface InteractionCreateInput {
  hcp_id: number;
  interaction_mode: string;
  interaction_type: string;
  interaction_date: string;
  summary: string;
  products_discussed: string;
  follow_up_date?: string | null;
  status: string;
}

export interface InteractionResponse {
  id: number;
  hcp_id: number;
  interaction_mode: string;
  interaction_type: string;
  interaction_date: string;
  summary: string;
  products_discussed: string;
  follow_up_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageInput {
  message: string;
}

export interface ChatMessageResponse {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}
