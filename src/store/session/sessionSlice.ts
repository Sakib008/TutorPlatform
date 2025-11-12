// src/store/sessions/sessionSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { CreateVideoInput, Session } from "../types";
import { toast } from "sonner";

// State type
interface SessionsState {
  sessions: Session[];
  session: Session | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

function getErrorMessage(action: any, fallback: string) {
  if (typeof action.payload === "string") return action.payload;
  return action.error?.message ?? fallback;
}

const initialState: SessionsState = {
  sessions: [],
  session: null,
  status: "idle",
  error: null,
};
const token = localStorage.getItem("token") || "";
// fetch all sessions
export const fetchSessions = createAsyncThunk<
  Session[],
  void,
  { rejectValue: string }
>("sessions/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/sessions", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ?? err.message ?? "Fetch failed"
    );
  }
});

// fetch session by id
export const fetchSessionById = createAsyncThunk<
  Session,
  void,
  { rejectValue: string }
>("sessions/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/sessions/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ??
        error.message ??
        "Failed to fetch session"
    );
  }
});

// create session
export const createSession = createAsyncThunk<
  Session,
  { title: string; description: string | null },
  { rejectValue: string }
>("sessions/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/sessions", payload, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return res.data?.data ?? res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ?? err.message ?? "Create failed"
    );
  }
});

// delete session (returns deleted id)
export const deleteSession = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("sessions/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/sessions/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ?? err.message ?? "Delete failed"
    );
  }
});

// create video
export const createVideo = createAsyncThunk(
  "videos/createVideo",
  async (videoData: CreateVideoInput, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("title", videoData.title);
      formData.append("description", videoData.description || "");
      formData.append("sessionId", videoData.sessionId);
      if (videoData.duration)
        formData.append("duration", videoData.duration.toString());
      if (!videoData.file) {
        return rejectWithValue("File is required");
      }
      formData.append("video", videoData.file);
      const res = await api.post("/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    } catch (error: any) {
      toast.error(
        "Failed to upload video: " +
          (error instanceof Error ? error.message : String(error))
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload video"
      );
    }
  }
);

// delete video
export const deleteVideo = createAsyncThunk<
  { sessionId?: string; id: string },
  string,
  { rejectValue: string }
>("videos/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/videos/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const data = res.data?.data ?? res.data;

    if (data && typeof data === "object" && "sessionId" in data) {
      return { id, sessionId: data.sessionId } as {
        sessionId?: string;
        id: string;
      };
    }

    return { id };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ?? err.message ?? "Delete video failed"
    );
  }
});

// Session Slice
const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchSessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchSessions.fulfilled,
        (state, action: PayloadAction<Session[]>) => {
          state.status = "succeeded";
          state.sessions = action.payload;
        }
      )
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch sessions";
      });

    // fetchSessionById
    builder
      .addCase(fetchSessionById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.session = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch session";
      });

    // createSession
    builder
      .addCase(createSession.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        createSession.fulfilled,
        (state, action: PayloadAction<Session>) => {
          state.status = "succeeded";
          // insert new session at top
          state.sessions.unshift(action.payload);
        }
      )
      .addCase(createSession.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to create session";
      });

    // deleteSession
    builder
      .addCase(deleteSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteSession.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = "succeeded";
          state.sessions = state.sessions.filter(
            (s) => s.id !== action.payload
          );
        }
      )
      .addCase(deleteSession.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to delete session";
      });

    // createVideo (we expect an updated Session)
    builder
      .addCase(createVideo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createVideo.fulfilled,
        (state, action: PayloadAction<Session>) => {
          state.status = "succeeded";
          const idx = state.sessions.findIndex(
            (s) => s.id === action.payload.id
          );
          if (idx !== -1) state.sessions[idx] = action.payload;
          else state.sessions.unshift(action.payload);
        }
      )
      .addCase(createVideo.rejected, (state, action) => {
        state.status = "failed";
        state.error = getErrorMessage(action, "Failed to add video");
      });

    // deleteVideo
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteVideo.fulfilled,
        (state, action: PayloadAction<{ sessionId?: string; id: string }>) => {
          state.status = "succeeded";
          const { sessionId, id } = action.payload;
          if (sessionId) {
            const session = state.sessions.find((s) => s.id === sessionId);
            if (session)
              session.videos = session.videos.filter((v) => v.id !== id);
          } else {
            // remove video from any session that has it
            state.sessions = state.sessions.map((s) => ({
              ...s,
              videos: s.videos.filter((v) => v.id !== id),
            }));
          }
        }
      )
      .addCase(deleteVideo.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to delete video";
      });
  },
});

export const { clearError } = sessionsSlice.actions;
export default sessionsSlice.reducer;
