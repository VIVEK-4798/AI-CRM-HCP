import apiInstance from '../api/axios';
import { ENDPOINTS } from '../utils/endpoints';
import type { InteractionPreview } from '../store/slices/chatSlice';

export interface AgentExecuteResponse {
  status: string;
  message?: string;
  preview?: InteractionPreview;
}

/**
 * Service to manage AI Chat/LangGraph cognitive workflow integrations.
 */
export const chatService = {
  /**
   * Sends a user chat message to the LangGraph agent endpoint.
   * Executes the agent pipeline and retrieves the structured tool output.
   */
  async sendMessage(message: string): Promise<AgentExecuteResponse> {
    const response = await apiInstance.post<AgentExecuteResponse>(
      ENDPOINTS.AGENT_EXECUTE, 
      { message }
    );
    return response.data;
  },
};

export default chatService;
