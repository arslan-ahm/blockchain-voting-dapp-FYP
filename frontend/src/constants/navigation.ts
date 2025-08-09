import { Role } from "../types";

export interface NavLink {
  to: string;
  label: string;
  icon?: string;
}

export const LANDING_PAGE_SECTIONS = [
  { label: 'Home', id: '#hero' },
  { label: 'About', id: '#about' },
  { label: 'Features', id: '#features' },
  { label: 'How It Works', id: '#how-it-works' },
  { label: 'Roadmap', id: '#roadmap' }
];

export const PUBLIC_ROUTES: NavLink[] = [
  { to: '/', label: 'Home' },
];

export const USER_ROUTES: NavLink[] = [
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/profile', label: 'Profile' },
];

export const ADMIN_ROUTES: NavLink[] = [
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/admin', label: 'Dashboard' },
];


export const AUTHENTICATED_ROUTES: NavLink[] = [
  { to: '/campaigns', label: 'Campaigns' },
];

export const getNavigationLinks = (isAuthenticated: boolean, userRole?: Role): NavLink[] => {
  const links: NavLink[] = [...PUBLIC_ROUTES];

  if (!isAuthenticated) {
    return links;
  }

  switch (userRole) {
    case Role.Admin:
      links.push(...ADMIN_ROUTES);
      break;
    case Role.Voter:
    case Role.Candidate:
    case Role.Unverified:
    case Role.PendingVerification:
      links.push(...USER_ROUTES);
      break;
    default:
      links.push({ to: '/campaigns', label: 'Campaigns' });
      break;
  }

  return links;
};

export const canAccessRoute = (route: string, isAuthenticated: boolean, userRole?: Role): boolean => {
  if (PUBLIC_ROUTES.some(r => r.to === route)) {
    return true;
  }

  if (!isAuthenticated) {
    return false;
  }

  switch (userRole) {
    case Role.Admin:
      return ADMIN_ROUTES.some(r => r.to === route);
    case Role.Voter:
    case Role.Candidate:
    case Role.Unverified:
    case Role.PendingVerification:
      return USER_ROUTES.some(r => r.to === route);
    default:
      return AUTHENTICATED_ROUTES.some(r => r.to === route);
  }
};