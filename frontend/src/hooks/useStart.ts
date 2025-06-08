// src/hooks/useStart.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { fetchUserDetails } from "../store/thunks/userThunks";
import { fetchCampaigns } from "../store/thunks/campaignThunks";
import { useWallet } from "../hooks/useWallet";

const useStart = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const { provider } = useWallet();

    useEffect(() => {
        if (user.account && provider) {
            console.log("Fetching user details for:", user.account);
            
            dispatch(fetchUserDetails({account:user.account, provider})).then((result) => {
                const payload = result.payload as { role?: string };
                console.log("Fetched user:", payload);
            });
            dispatch(fetchCampaigns());
        }
    }, [user.account, user.role, dispatch, provider]); // Fixed: Added missing dependencies

    return {
        user,
        isInitializing: user.loading && !user.details, // Add loading state
    };
};

export default useStart;