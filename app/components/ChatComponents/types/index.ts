// Shared types for tab components
export type TabType = "messages" | "savings";

export interface TabContentProps {
	children: React.ReactNode;
	isActive: boolean;
	index: number;
}

export interface TabButtonProps {
	activeTab: TabType;
	onPress: () => void;
	theme: any;
}

export interface HeaderProps {
	activeTab: TabType;
	onTabSwitch: () => void;
	theme: any;
} 