import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import adminReducer from "./slices/adminSlice";
import campaignReducer from "./slices/campaignSlice";
import verificationReducer from "./slices/verificationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    campaign: campaignReducer,
    admin: adminReducer,
    verification: verificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;