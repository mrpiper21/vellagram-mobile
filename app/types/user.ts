export interface User {
    id?: string
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePicture: string | null;
    walletAddress: string | null;
    groups: string[];
} 