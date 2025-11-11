// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk,type PayloadAction } from "@reduxjs/toolkit";
import api from "../../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
let storedUser = null;

try {
  const userData = localStorage.getItem("user");
  storedUser = userData ? JSON.parse(userData) : null;
} catch {
  storedUser = null;
  localStorage.removeItem("user"); // cleanup invalid data
}

const initialState: AuthState = {
  user: storedUser,
  token: localStorage.getItem("token") || null,
  status: "idle",
  error: null,
};

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: { name: string; email: string; password: string; role ?: "ADMIN" | "STUDENT" },{rejectWithValue}) => {
   try {
     const res = await api.post("/auth/register", formData);
     return res.data;
   } catch (error : any) {
        return rejectWithValue(
            error.response?.data?.message ?? error.message ?? "Registration failed"
        );
   }
  }
);

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData: { email: string; password: string }, { rejectWithValue }) => {
   try {
     const res = await api.post("/auth/login", formData);
     console.log("Login response : ",res.data);
     return res.data.data;
   } catch (error : any) {
        return rejectWithValue(
            error.response?.data?.message ?? error.message ?? "Login failed"
        );
   }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Registration failed";
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
