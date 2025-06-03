import { useAppSelector } from "./useRedux";
import { getNavigationLinks, canAccessRoute } from "../constants/navigation";
import { Role } from "../types";

export const useNavigation = () => {
    const user = useAppSelector((state) => state.user);

    const isAuthenticated = !!user.account;
    const userRole = user.role;

    const navigationLinks = getNavigationLinks(isAuthenticated, userRole);

    const canUserAccessRoute = (route: string): boolean => {
        return canAccessRoute(route, isAuthenticated, userRole);
    };

    const getUserTypeDisplay = (): string => {
        if (!isAuthenticated) return 'Guest';

        switch (userRole) {
            case Role.Admin:
                return 'Administrator';
            case Role.Voter:
                return 'Voter';
            case Role.Candidate:
                return 'Candidate';
            case Role.Unverified:
                return 'Unverified User';
            case Role.PendingVerification:
                return 'Pending Verification';
            default:
                return 'User';
        }
    };

    return {
        navigationLinks,
        canUserAccessRoute,
        isAuthenticated,
        userRole,
        userAccount: user.account,
        userDetails: user.details,
        getUserTypeDisplay,
    };
};