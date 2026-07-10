import apiInstance from '../api/axios';
import { ENDPOINTS } from '../utils/endpoints';
import type { HCPCreateInput, HCPResponse } from '../types';

/**
 * Service to manage HCP profile network calls with the backend.
 */
export const hcpService = {
  /**
   * Fetches all HCP profiles.
   */
  async getAll(): Promise<HCPResponse[]> {
    const response = await apiInstance.get<HCPResponse[]>(`${ENDPOINTS.HCPS}/`);
    return response.data;
  },

  /**
   * Fetches a single HCP profile by primary ID.
   */
  async getById(id: number): Promise<HCPResponse> {
    const response = await apiInstance.get<HCPResponse>(`${ENDPOINTS.HCPS}/${id}`);
    return response.data;
  },

  /**
   * Creates a new HCP profile.
   */
  async create(data: HCPCreateInput): Promise<HCPResponse> {
    const response = await apiInstance.post<HCPResponse>(`${ENDPOINTS.HCPS}/`, data);
    return response.data;
  },

  /**
   * Updates an existing HCP profile.
   */
  async update(id: number, data: Partial<HCPCreateInput>): Promise<HCPResponse> {
    const response = await apiInstance.put<HCPResponse>(`${ENDPOINTS.HCPS}/${id}`, data);
    return response.data;
  },

  /**
   * Deletes an HCP profile.
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiInstance.delete<{ message: string }>(`${ENDPOINTS.HCPS}/${id}`);
    return response.data;
  },
};

export default hcpService;
