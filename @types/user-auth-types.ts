export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string | null; 
    walletAddress?: `0x${string}` | null;
    groups: Group[];
}

export interface IUserRegistrationData extends IUser  {
    password: string;
    confirmPassword: string;
    pin: string;
    confirmPin: string;
  }

  export interface Group {
    id: string;
    name: string;
  }

