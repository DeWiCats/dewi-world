export interface Profile {
  user_id: string;
  username: string;
  avatar: string;
  dewi_verified?: boolean;
  blue_chip?: boolean;
  verified_address?: boolean;
}

export interface ProfileCreationRequest {
  user_id: string;
  username: string;
  avatar: string;
}

export interface RegisterUserRequest {
  dewiAddress: string;
  email: string;
}

export interface VerifyUserRequest {
  dewiAddress: string;
}
