import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  addMessage, 
  setPreview, 
  setLoading, 
  setError, 
  updatePreviewField, 
  clearPreview, 
  resetChat 
} from '../store/slices/chatSlice';
import chatService from '../services/chatService';
import interactionService from '../services/interactionService';
import type { InteractionPreview } from '../store/slices/chatSlice';

/**
 * Custom React Hook managing the AI Chat lifecycle.
 * Binds page flows directly to the Redux store state and the Axios service layer.
 */
export function useChat() {
  const dispatch = useAppDispatch();

  // Retrieve values from the central Redux store
  const { messages, preview, loading, error } = useAppSelector((state) => state.chat);

  /**
   * Dispatches the user's note to the LangGraph executor and populates the Preview state.
   */
  const sendChatMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    // 1. Append user message locally
    const userMsg = {
      id: Date.now(),
      sender: 'user' as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    dispatch(addMessage(userMsg));

    try {
      // 2. Dispatch query to backend LangGraph agent execution pipeline
      const data = await chatService.sendMessage(text);

      if (data.status === 'success' && data.preview) {
        // 3. Set preview details extracted by the AI LogInteractionTool
        dispatch(setPreview(data.preview));
        
        // 4. Append assistant confirmation message
        const assistantMsg = {
          id: Date.now() + 1,
          sender: 'assistant' as const,
          text: "I have parsed your latest note. The values in the 'AI Extracted Preview' card are updated. Please review them, make edits if needed, and confirm to save.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch(addMessage(assistantMsg));
      } else {
        throw new Error(data.message || "Failed to extract interaction variables.");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || "Unable to process interaction.";
      dispatch(setError(errMsg));
      
      // Append failure reply from assistant
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant' as const,
        text: "Unable to process interaction. Please check doctor name/notes and try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      dispatch(addMessage(assistantMsg));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Updates fields within the current active preview.
   */
  const updatePreview = useCallback((fieldUpdates: Partial<InteractionPreview>) => {
    dispatch(updatePreviewField(fieldUpdates));
  }, [dispatch]);

  /**
   * Discards the active preview and returns to empty/fresh state.
   */
  const discardPreview = useCallback(() => {
    dispatch(clearPreview());
  }, [dispatch]);

  /**
   * Commits the reviewed/edited preview data directly to the database via the Interaction API.
   */
  const confirmAndSave = useCallback(async (activePreview: InteractionPreview): Promise<any> => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      // Format follow-up date to ISO string if set
      const followUpDateStr = activePreview.follow_up_date 
        ? new Date(activePreview.follow_up_date).toISOString() 
        : null;

      // Dispatch request to post new interaction to DB
      const result = await interactionService.create({
        hcp_id: activePreview.hcp_id,
        interaction_mode: "CHAT", // Logged via Chat agent workflow
        interaction_type: activePreview.interaction_type,
        interaction_date: new Date().toISOString(),
        summary: activePreview.summary,
        products_discussed: activePreview.products_discussed,
        follow_up_date: followUpDateStr,
        status: activePreview.status,
      });

      // Clear preview card and reset chat logs upon successful database write
      dispatch(clearPreview());
      dispatch(resetChat());
      return result;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to commit interaction to database.";
      dispatch(setError(errMsg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Resets conversational logs.
   */
  const clearChat = useCallback(() => {
    dispatch(resetChat());
  }, [dispatch]);

  return {
    messages,
    preview,
    loading,
    error,
    sendChatMessage,
    updatePreview,
    discardPreview,
    confirmAndSave,
    clearChat,
  };
}
