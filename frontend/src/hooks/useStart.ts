import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { Role } from "../types";
import { fetchUserDetails } from "../store/thunks/userThunks";
import { fetchCampaigns } from "../store/thunks/campaignThunks";


const useStart = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    useEffect(() => {
        if (user.account && user.role !== Role.Admin) {
            console.log("Fetching user details for:", user.account);
            dispatch(fetchUserDetails(user.account)).then((result) => {
                const payload = result.payload as { role?: string };
                console.log("Fetched user:", payload);
            });
            dispatch(fetchCampaigns());
        }
    }, []);

    return {
        user,
    }
}


export default useStart;