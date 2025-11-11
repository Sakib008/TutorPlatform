import { configureStore } from '@reduxjs/toolkit';
import sessionsReducer from './session/sessionSlice.ts';
import authReducer from './session/authSlice.ts';


export const store = configureStore({
reducer: {
sessions: sessionsReducer,
auth: authReducer,
},
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;