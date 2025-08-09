
export interface UserDetails {
  name?: string;
  email?: string;
  contactNumber?: string;
  dateOfBirth?: number;
  identityNumber?: string;
  bio?: string;
  profileImageIpfsHash?: string;
  supportiveLinks?: string[];
}


export interface ProfilePreviewProps {
  watchedValues: Partial<UserDetails>;
  previewImageUrl: string;
  currentUser: UserState;
}
