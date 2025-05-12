import { createSlice } from '@reduxjs/toolkit';
import { Role, type UserDetails } from '../../types';
import { fetchUserDetails, updateUserDetails } from '../thunks/userThunks';

interface UserState {
  account: string | null;
  details: UserDetails | null;
  role: Role;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  account: null,
  details: null,
  role: Role.Unverified,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.account = action.payload.account;
    },
    clearUser(state) {
      state.account = null;
      state.details = null;
      state.role = Role.Unverified;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.details = action.payload.details;
        state.role = action.payload.role;
        state.loading = false;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user details';
      })
      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.details = action.payload;
        state.loading = false;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user details';
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;