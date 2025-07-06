import { IUser } from "@/@types/user-auth-types";

export interface Contact {
	id: string;
	name: string;
	phone?: string;
	email?: string;
	profile?: string;
	userData?: IUser;
}

export interface SavingsGroupData {
	groupName: string;
	targetAmount: string;
	savingType: string;
	description: string;
	visibility: "private" | "public";
	members: Contact[];
}

export interface SavingType {
	id: string;
	name: string;
	description: string;
}

export const SAVING_TYPES: SavingType[] = [
	{ id: "rotational", name: "Rotational Savings", description: "Members take turns receiving the full amount" },
	{ id: "collective", name: "Collective Savings", description: "All members contribute to a shared goal" },
	{ id: "emergency", name: "Emergency Fund", description: "For unexpected expenses and emergencies" },
	{ id: "investment", name: "Investment Pool", description: "Collective investment opportunities" },
]; 