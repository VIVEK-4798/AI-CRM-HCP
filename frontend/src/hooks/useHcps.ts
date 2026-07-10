import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setLoading, setError, setHcps, addHcp, updateHcpState, removeHcpState } from '../store/slices/hcpSlice';
import hcpService from '../services/hcpService';
import type { HCPCreateInput } from '../types';
import { formatApiError } from '../utils/apiError';

/**
 * Custom React Hook managing HCP state operations linked directly to Redux.
 * Every operation fetches/saves to backend and refreshes Redux states.
 */
export function useHcps() {
  const dispatch = useAppDispatch();
  
  // Connect to Redux store values directly
  const { hcps, loading, error } = useAppSelector((state) => state.hcp);

  /**
   * Loads all HCPs from database backend and pushes to Redux.
   */
  const fetchHcps = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await hcpService.getAll();
      dispatch(setHcps(data));
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Fetches a single HCP profile by primary ID.
   */
  const fetchHcpById = useCallback(async (id: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await hcpService.getById(id);
      dispatch(setLoading(false));
      return data;
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Dispatches POST request to save new HCP profile and commits changes to Redux.
   */
  const createHcp = useCallback(async (input: HCPCreateInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const newHcp = await hcpService.create(input);
      dispatch(addHcp(newHcp));
      return newHcp;
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Dispatches PUT request to update HCP profile details and updates Redux state.
   */
  const updateHcp = useCallback(async (id: number, input: Partial<HCPCreateInput>) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const updated = await hcpService.update(id, input);
      dispatch(updateHcpState(updated));
      return updated;
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Dispatches DELETE request and removes the HCP profile from Redux.
   */
  const deleteHcp = useCallback(async (id: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await hcpService.delete(id);
      dispatch(removeHcpState(id));
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  return {
    hcps,
    loading,
    error,
    fetchHcps,
    fetchHcpById,
    createHcp,
    updateHcp,
    deleteHcp,
  };
}
