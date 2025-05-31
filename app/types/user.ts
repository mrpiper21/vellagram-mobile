export interface User {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePicture: string | null;
    walletAddress: string | null;
    groups: string[];
} 