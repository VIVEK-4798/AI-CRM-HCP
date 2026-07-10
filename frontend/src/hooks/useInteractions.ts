import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setLoading, setError, setInteractions, addInteraction, updateInteractionState, removeInteractionState } from '../store/slices/interactionSlice';
import interactionService from '../services/interactionService';
import type { InteractionCreateInput } from '../types';
import { formatApiError } from '../utils/apiError';

/**
 * Custom React Hook managing Interaction log state operations linked directly to Redux.
 * Every operation fetches/saves to backend and refreshes Redux states.
 */
export function useInteractions() {
  const dispatch = useAppDispatch();

  // Connect to Redux store values directly
  const { interactions, loading, error } = useAppSelector((state) => state.interaction);

  /**
   * Loads all interaction records from database backend and pushes to Redux.
   */
  const fetchInteractions = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await interactionService.getAll();
      dispatch(setInteractions(data));
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Fetches a single interaction log details by ID.
   */
  const fetchInteractionById = useCallback(async (id: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await interactionService.getById(id);
      dispatch(setLoading(false));
      return data;
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Dispatches POST request to save new interaction record and commits changes to Redux.
   */
  const createInteraction = useCallback(async (input: InteractionCreateInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const newInteraction = await interactionService.create(input);
      dispatch(addInteraction(newInteraction));
      return newInteraction;
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Dispatches PUT request to update interaction details and updates Redux state.
   */
  const updateInteraction = useCallback(async (id: number, input: Partial<InteractionCreateInput>) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const updated = await interactionService.update(id, input);
      dispatch(updateInteractionState(updated));
      return updated;
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  /**
   * Dispatches DELETE request and removes the interaction from Redux.
   */
  const deleteInteraction = useCallback(async (id: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await interactionService.delete(id);
      dispatch(removeInteractionState(id));
    } catch (err) {
      const parsedError = formatApiError(err);
      dispatch(setError(parsedError));
      throw err;
    }
  }, [dispatch]);

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    fetchInteractionById,
    createInteraction,
    updateInteraction,
    deleteInteraction,
  };
}
