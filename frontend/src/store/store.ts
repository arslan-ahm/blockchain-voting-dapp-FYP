import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import campaignReducer from "./slices/campaignSlice";
import voteReducer from "./slices/voteSlice";
import verificationReducer from "./slices/verificationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    campaign: campaignReducer,
    vote: voteReducer,
    verification: verificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;