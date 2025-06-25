export interface IUser {
  id?:string
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string | null; 
    pin: string;
    walletAddress?: `0x${string}` | null;
    password?: string;
    groups: Group[];
    token?: string
}

export interface IUserRegistrationData extends IUser  {
    password: string;
    confirmPassword: string;
    confirmPin: string;
  }

  export interface Group {
    id: string;
    name: string;
  }

