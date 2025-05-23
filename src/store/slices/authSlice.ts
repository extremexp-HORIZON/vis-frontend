import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  CredentialsResponse,
  LoginCredentials,
} from '../../shared/models/auth.model';
import { authApi } from '../../app/api/api';
import type { AxiosError } from 'axios';

interface AuthState {
  token: string | null
  isLoading: boolean
  error: unknown | null
}

export const saveToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Load initial state from localStorage if token exists
const loadInitialState = (): AuthState => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    return {
      token: token,
      isLoading: false,
      error: null,
    };
  }

  return {
    token: null,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

export const checkAuthentication = async (externalToken: string) => {
  if (externalToken.length === 0) {
    return false;
  }
  saveToken(externalToken);
  try {
    // Decode the token to check its validity and expiration
    await authApi.get('/extreme_auth/api/v1/person/userinfo', {
      headers: {
        Authorization: `Bearer ${externalToken}`,
      },
    });

    return true;
  } catch (error) {
    removeToken();

    return false;
  }
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.token = null;
      });
  },
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      if (!credentials.username || !credentials.password) {
        return rejectWithValue('Username and password are required');
      }

      const response = await authApi.post<CredentialsResponse>(
        '/extreme_auth/api/v1/person/login',
        credentials,
      );

      // Save token to localStorage if it exists in the response
      if (response.data && response.data.access_token) {
        saveToken(response.data.access_token);
      }

      return response.data.access_token;
    } catch (err) {
      const error = err as AxiosError<{ error_description?: string }>;

      if (error.response?.data?.error_description) {
        return rejectWithValue(
          error.response.data.error_description || 'Login failed',
        );
      }

      return rejectWithValue('Login failed');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  removeToken();

  return null;
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
