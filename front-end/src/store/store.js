import { configureStore } from '@reduxjs/toolkit';
import votingReducer from './slices/voting.slice';

export const store = configureStore({
  reducer: {
    voting: votingReducer,
  },
});