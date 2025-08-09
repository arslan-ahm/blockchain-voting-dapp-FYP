// src/hooks/useStart.ts
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { fetchUserDetails } from "../store/thunks/userThunks";
import { fetchCampaigns } from "../store/thunks/campaignThunks";
import { useWallet } from "../hooks/useWallet";

const useStart = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const { provider } = useWallet();
    const [isInitializing, setIsInitializing] = useState<boolean>(false);

    useEffect(() => {
        if (user.account && provider) {
            setIsInitializing(true);
            console.log("Fetching user details for:", user.account);
            
            dispatch(fetchUserDetails({account:user.account, provider})).then((result) => {
                const payload = result.payload as { role?: string };
                console.log("Fetched user:", payload);
            });
            dispatch(fetchCampaigns());
            setIsInitializing(false);
        }
    }, [user.account, user.role, dispatch, provider]);

    return {
        user,
        isInitializing,
    };
};

export default useStart;