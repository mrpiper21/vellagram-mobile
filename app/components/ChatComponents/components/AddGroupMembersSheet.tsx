import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
	Dimensions,
	FlatList,
	Image,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { IUser } from "@/@types/user-auth-types";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserInactivity } from "@/context/UserInactivityContext";
import { normalizeIdentifiers } from "@/helpers/normalizeIdentifiers";
import { useContactStore } from "@/store/useContactStore";

const { height: screenHeight } = Dimensions.get("window");

interface Contact {
	id: string;
	name: string;
	phone?: string;
	email?: string;
	profile?: string;
	userData?: IUser;
}

interface AddGroupMembersSheetProps {
	visible: boolean;
	onClose: () => void;
	onConfirm: (selectedContacts: Contact[]) => void;
	selectedContacts: Contact[];
}

const AddGroupMembersSheet: React.FC<AddGroupMembersSheetProps> = ({
	visible,
	onClose,
	onConfirm,
	selectedContacts,
}) => {
	const theme = useAppTheme();
	const { contacts } = useContactStore();
	const { allUsers } = useUserInactivity();
	const [searchQuery, setSearchQuery] = useState("");
	const [localSelectedContacts, setLocalSelectedContacts] = useState<Contact[]>(selectedContacts);
	
	// Update local state when selectedContacts prop changes
	useEffect(() => {
		setLocalSelectedContacts(selectedContacts);
	}, [selectedContacts]);

	// Create user map for efficient lookup (same logic as ContactsScreen)
	const userMap = useMemo(() => {
		const map = new Map<string, IUser>();
		if (!allUsers) return map;

		allUsers.forEach(user => {
			const normalizedNumbers = normalizeIdentifiers(user.phone);
			normalizedNumbers.forEach(num => {
				if (!map.has(num)) {
					map.set(num, user);
				}
			});
		});
		return map;
	}, [allUsers]);

	// Calculate registered contacts using the same logic as ContactsScreen
	const registeredContacts = useMemo(() => {
		return contacts
			.map(sc => {
				const normalizedPhones = normalizeIdentifiers(sc.phoneNumber);
				let matchingUser: IUser | undefined;

				// Try to find a matching user with any of the normalized phone variations
				for (const phone of normalizedPhones) {
					const user = userMap.get(phone);
					if (user) {
						matchingUser = user;
						break;
					}
				}

				// Only include contacts that are actually registered
				if (matchingUser) {
					return {
						id: sc.id,
						name: sc.name || sc.phoneNumber,
						phone: sc.phoneNumber,
						profile: sc.avatar || undefined,
						email: matchingUser.email || undefined,
						userData: matchingUser,
					} as Contact;
				}
				return null;
			})
			.filter((contact): contact is Contact => contact !== null);
	}, [contacts, userMap]);

	// Filter contacts based on search query
	const filteredContacts = registeredContacts.filter((contact) =>
		contact.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
	);

	const handleContactToggle = (contact: Contact) => {
		const isSelected = localSelectedContacts.some((c) => c.id === contact.id);
		if (isSelected) {
			setLocalSelectedContacts(localSelectedContacts.filter((c) => c.id !== contact.id));
		} else {
			setLocalSelectedContacts([...localSelectedContacts, contact]);
		}
	};

	const handleConfirm = () => {
		onConfirm(localSelectedContacts);
		onClose();
	};

	const handleClose = () => {
		setLocalSelectedContacts(selectedContacts); // Reset to original selection
		onClose();
	};

	const isContactSelected = (contactId: string) => {
		return localSelectedContacts.some((c) => c.id === contactId);
	};

	const renderContactItem = ({ item }: { item: Contact }) => {
		const isSelected = isContactSelected(item.id);
		
		return (
			<TouchableOpacity
				style={[
					styles.contactItem,
					{
						backgroundColor: isSelected ? theme.tint + "20" : theme.background,
						borderColor: theme.border,
					},
				]}
				onPress={() => handleContactToggle(item)}
				activeOpacity={0.7}
			>
				<View style={styles.contactAvatar}>
					{item.profile ? (
						<Image source={{ uri: item.profile }} style={styles.avatarImage} />
					) : (
						<View style={[styles.avatarPlaceholder, { backgroundColor: theme.tint }]}>
							<AntDesign name="user" size={28} color={theme.background} />
						</View>
					)}
				</View>
				
				<View style={styles.contactInfo}>
					<Text style={[styles.contactName, { color: theme.text }]}>
						{item.name}
					</Text>
					{item.phone && (
						<Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
							{item.phone}
						</Text>
					)}
				</View>

				<View style={styles.selectionIndicator}>
					{isSelected ? (
						<View style={[styles.selectedCircle, { backgroundColor: theme.tint }]}>
							<Ionicons name="checkmark" size={16} color="white" />
						</View>
					) : (
						<View style={[styles.unselectedCircle, { borderColor: theme.border }]} />
					)}
				</View>
			</TouchableOpacity>
		);
	};

	const renderSelectedContacts = () => {
		if (localSelectedContacts.length === 0) return null;

		return (
			<View style={styles.selectedContactsContainer}>
				<Text style={[styles.selectedContactsTitle, { color: theme.text }]}>
					Selected Members ({localSelectedContacts.length})
				</Text>
				<View style={styles.selectedContactsList}>
					{localSelectedContacts.map((contact, index) => (
						<View key={contact.id} style={styles.selectedContactAvatar}>
							{contact.profile ? (
								<Image source={{ uri: contact.profile }} style={styles.selectedAvatarImage} />
							) : (
								<View style={[styles.selectedAvatarPlaceholder, { backgroundColor: theme.tint }]}>
									<AntDesign name="user" size={40} color={theme.background} />
								</View>
							)}
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => handleContactToggle(contact)}
							>
								<Ionicons name="close-circle" size={16} color={theme.textSecondary} />
							</TouchableOpacity>
							<Text style={{color: theme.icon}}>{contact?.name}</Text>
						</View>
					))}
				</View>
			</View>
		);
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={handleClose}
		>
			<View style={styles.overlay}>
				<TouchableOpacity style={styles.backdrop} onPress={handleClose} />
				<View style={[styles.sheet, { backgroundColor: theme.background }]}>
					{/* Header */}
					<View style={styles.header}>
						<View style={styles.headerContent}>
							<TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
								<Text style={[styles.cancelText, { color: theme.textSecondary }]}>
									Cancel
								</Text>
							</TouchableOpacity>
							<Text style={[styles.headerTitle, { color: theme.text }]}>
								Add Members
							</Text>
							<TouchableOpacity
								onPress={handleConfirm}
								disabled={localSelectedContacts.length === 0}
								style={[
									styles.confirmButton,
									{
										opacity: localSelectedContacts.length === 0 ? 0.5 : 1,
									},
								]}
							>
								<Text style={[styles.confirmText, { color: theme.tint }]}>
									Done
								</Text>
							</TouchableOpacity>
						</View>
						<View style={[styles.headerLine, { backgroundColor: theme.border }]} />
					</View>

					{/* Search Bar */}
					<View style={styles.searchContainer}>
						<View style={[styles.searchInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
							<Ionicons name="search" size={20} color={theme.textSecondary} />
							<TextInput
								style={[styles.searchTextInput, { color: theme.text }]}
								placeholder="Search contacts..."
								placeholderTextColor={theme.textSecondary}
								value={searchQuery}
								onChangeText={setSearchQuery}
								autoCapitalize="none"
								autoCorrect={false}
							/>
						</View>
					</View>

					{/* Selected Contacts */}
					{renderSelectedContacts()}

					{/* Contacts List */}
					<FlatList
						data={filteredContacts}
						renderItem={renderContactItem}
						keyExtractor={(item) => item.id}
						style={styles.contactsList}
						contentContainerStyle={styles.contactsContent}
						showsVerticalScrollIndicator={false}
					/>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sheet: {
		height: screenHeight * 0.95,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		overflow: "hidden",
	},
	header: {
		paddingTop: 20,
		paddingBottom: 16,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	cancelButton: {
		padding: 8,
	},
	cancelText: {
		fontSize: 16,
		fontWeight: "500",
	},
	confirmButton: {
		padding: 8,
	},
	confirmText: {
		fontSize: 16,
		fontWeight: "600",
	},
	headerLine: {
		height: 1,
		marginTop: 16,
		marginHorizontal: 20,
	},
	searchContainer: {
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	searchInput: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 12,
	},
	searchTextInput: {
		flex: 1,
		fontSize: 16,
		fontWeight: "400",
	},
	selectedContactsContainer: {
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	selectedContactsTitle: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 12,
	},
	selectedContactsList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	selectedContactAvatar: {
		position: "relative",
		alignItems: "center",
		justifyContent: 'center',
		gap: 4
	},
	selectedAvatarImage: {
		width: 58,
		height: 58,
		borderRadius: 20,
	},
	selectedAvatarPlaceholder: {
		width: 60,
		height: 60,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	removeButton: {
		position: "absolute",
		top: -4,
		right: -4,
		backgroundColor: "white",
		borderRadius: 10,
	},
	contactsList: {
		flex: 1,
	},
	contactsContent: {
		// paddingHorizontal: 20,
		paddingBottom: 20,
	},
	contactItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		// marginBottom: 8,
	},
	contactAvatar: {
		marginRight: 12,
	},
	avatarImage: {
		width: 58,
		height: 58,
		borderRadius: 20,
	},
	avatarPlaceholder: {
		width: 58,
		height: 58,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	contactInfo: {
		flex: 1,
	},
	contactName: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 2,
	},
	contactPhone: {
		fontSize: 14,
		fontWeight: "400",
	},
	selectionIndicator: {
		marginLeft: 12,
	},
	selectedCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	unselectedCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
	},
});

export default AddGroupMembersSheet; 