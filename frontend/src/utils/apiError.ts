import type { AxiosError } from 'axios';

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface BackendErrorResponse {
  detail?: string | ValidationErrorDetail[];
}

/**
 * Parses and formats Axios HTTP errors into human-readable user messages.
 * Catches validation errors, network failures, and standard server errors.
 * 
 * @param error The thrown error object from API response catch block.
 * @returns A clean string explanation of the failure.
 */
export function formatApiError(error: unknown): string {
  // Check if error matches AxiosError structure
  if (error && typeof error === 'object' && (error as any).isAxiosError === true) {
    const axiosError = error as AxiosError<BackendErrorResponse>;
    
    if (axiosError.response) {
      const data = axiosError.response.data;
      
      // Attempt to extract detail messages returned by FastAPI/Pydantic
      if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') {
          return data.detail;
        }
        if (Array.isArray(data.detail)) {
          // Format Pydantic field validation errors (e.g. "body.email: Invalid email format")
          return data.detail
            .map(err => {
              const field = err.loc.slice(1).join('.') || 'field';
              return `${field}: ${err.msg}`;
            })
            .join(' | ');
        }
      }

      // Fallback on standard HTTP Status messages
      switch (axiosError.response.status) {
        case 400:
          return "Bad request. Please verify the parameters entered.";
        case 401:
          return "Session expired or unauthorized. Please re-authenticate.";
        case 403:
          return "Access denied. You do not possess the required clearance.";
        case 404:
          return "Requested resource not found.";
        case 500:
          return "Internal server error occurred on the database host. Please contact support.";
        default:
          return `An error occurred (HTTP ${axiosError.response.status}).`;
      }
    } else if (axiosError.request) {
      // The request was initiated, but no response was returned by the host
      return "Network error. The server could not be reached. Ensure the backend is active.";
    }
  }

  // Handle standard Javascript errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unknown transaction failure occurred.";
}
