import apiInstance from '../api/axios';
import { ENDPOINTS } from '../utils/endpoints';
import type { InteractionCreateInput, InteractionResponse } from '../types';

/**
 * Service to manage Interaction log network calls with the backend.
 */
export const interactionService = {
  /**
   * Fetches all interaction records.
   */
  async getAll(): Promise<InteractionResponse[]> {
    const response = await apiInstance.get<InteractionResponse[]>(`${ENDPOINTS.INTERACTIONS}/`);
    return response.data;
  },

  /**
   * Fetches a single interaction record by ID.
   */
  async getById(id: number): Promise<InteractionResponse> {
    const response = await apiInstance.get<InteractionResponse>(`${ENDPOINTS.INTERACTIONS}/${id}`);
    return response.data;
  },

  /**
   * Logs a new interaction.
   */
  async create(data: InteractionCreateInput): Promise<InteractionResponse> {
    const response = await apiInstance.post<InteractionResponse>(`${ENDPOINTS.INTERACTIONS}/`, data);
    return response.data;
  },

  /**
   * Updates an interaction record.
   */
  async update(id: number, data: Partial<InteractionCreateInput>): Promise<InteractionResponse> {
    const response = await apiInstance.put<InteractionResponse>(`${ENDPOINTS.INTERACTIONS}/${id}`, data);
    return response.data;
  },

  /**
   * Deletes an interaction record.
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiInstance.delete<{ message: string }>(`${ENDPOINTS.INTERACTIONS}/${id}`);
    return response.data;
  },
};

export default interactionService;
