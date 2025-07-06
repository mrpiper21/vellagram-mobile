import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import { CreateGroup } from "@/services/group.service";
import { useUserStore } from "@/store/useUserStore";
import { Contact, SAVING_TYPES, SavingsGroupData } from "../types/savings-group";
import AddGroupMembersSheet from "./AddGroupMembersSheet";
import GroupCreationConfirmation from "./GroupCreationConfirmation";
import SavingTypeSelector from "./SavingTypeSelector";
import SelectedMembersDisplay from "./SelectedMembersDisplay";
import VisibilityToggle from "./VisibilityToggle";

const { height: screenHeight } = Dimensions.get("window");

interface CreateSavingsGroupSheetProps {
	visible: boolean;
	onClose: () => void;
	onCreate: (data: SavingsGroupData) => void;
}

const CreateSavingsGroupSheet: React.FC<CreateSavingsGroupSheetProps> = ({
	visible,
	onClose,
	onCreate,
}) => {
	const theme = useAppTheme();
	const [formData, setFormData] = useState<SavingsGroupData>({
		groupName: "",
		targetAmount: "",
		savingType: "",
		description: "",
		visibility: "private",
		members: [],
	});

	const [selectedSavingType, setSelectedSavingType] = useState<string>("");
	const [showMembersSheet, setShowMembersSheet] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [createdGroupData, setCreatedGroupData] = useState<SavingsGroupData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const {user} = useUserStore((state) => state)
	const spinValue = useRef(new Animated.Value(0)).current;

	// Spinner animation
	useEffect(() => {
		if (isLoading) {
			Animated.loop(
				Animated.timing(spinValue, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				})
			).start();
		} else {
			spinValue.setValue(0);
		}
	}, [isLoading]);

	const spin = spinValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	const handleInputChange = (field: keyof SavingsGroupData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSavingTypeSelect = (typeId: string) => {
		setSelectedSavingType(typeId);
		handleInputChange("savingType", typeId);
	};

	const handleCreate = async() => {
		if (formData.groupName.trim() && formData.targetAmount.trim() && formData.savingType) {
			setIsLoading(true);
			
			try {
				let _members: string[] = []

				for(let i=0; i < formData.members.length; i++){
					_members.push(formData.members[i].id);
				}

				console.log("🔐 Group Creation - User token:", user?.token);
				console.log("🔐 Group Creation - User ID:", user?.id);
				console.log("member ------", _members, "token: ",user?.token)
				console.log("Creating group with data:", {name: formData.groupName, userIds: [..._members, user?.id as string]})
				
				const response = await CreateGroup({name: formData.groupName, userIds: [..._members, user?.id as string], token: user?.token as string})

				console.log("API Response:", response)

				if(response){
					// Only call onCreate and show confirmation after successful API call
					onCreate(formData);
					setCreatedGroupData(formData);
					setShowConfirmation(true);
					
					// Reset form after successful creation
					setFormData({
						groupName: "",
						targetAmount: "",
						savingType: "",
						description: "",
						visibility: "private",
						members: [],
					});
					setSelectedSavingType("");
				} else {
					console.error('Group creation failed - no response received');
					// You can show an error message to the user here
				}
			} catch (error) {
				console.error('Error creating group:', error);
				// You can add error handling here (show toast, alert, etc.)
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleCloseConfirmation = () => {
		setShowConfirmation(false);
		onClose();
	};

	const handleMembersConfirm = (selectedContacts: Contact[]) => {
		setFormData(prev => ({ ...prev, members: selectedContacts }));
		setShowMembersSheet(false);
	};

	const handleOpenMembersSheet = () => {
		setShowMembersSheet(true);
	};

	const handleRemoveMember = (memberId: string) => {
		const updatedMembers = formData.members.filter(m => m.id !== memberId);
		setFormData(prev => ({ ...prev, members: updatedMembers }));
	};

	const isFormValid = formData.groupName.trim() && formData.targetAmount.trim() && formData.savingType;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<TouchableOpacity style={styles.backdrop} onPress={onClose} />
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.keyboardAvoid}
				>
					<View style={[styles.sheet, { backgroundColor: theme.background }]}>
						{/* Header */}
						<View style={styles.header}>
							<View style={styles.headerContent}>
								<Text style={[styles.headerTitle, { color: theme.text }]}>
									Create Savings Group
								</Text>
								<TouchableOpacity onPress={onClose} style={styles.closeButton}>
									<Ionicons name="close" size={24} color={theme.text} />
								</TouchableOpacity>
							</View>
							<View style={[styles.headerLine, { backgroundColor: theme.border }]} />
						</View>

						{/* Content */}
						<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
							{/* Group Name */}
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.text }]}>Group Name *</Text>
								<TextInput
									style={[styles.textInput, { 
										backgroundColor: theme.card, 
										borderColor: theme.border,
										color: theme.text 
									}]}
									placeholder="Enter group name"
									placeholderTextColor={theme.textSecondary}
									value={formData.groupName}
									onChangeText={(value) => handleInputChange("groupName", value)}
									maxLength={50}
								/>
							</View>

							{/* Target Amount */}
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.text }]}>Target Amount *</Text>
								<View style={[styles.amountInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
									<Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>$</Text>
									<TextInput
										style={[styles.amountTextInput, { color: theme.text }]}
										placeholder="0.00"
										placeholderTextColor={theme.textSecondary}
										value={formData.targetAmount}
										onChangeText={(value) => handleInputChange("targetAmount", value)}
										keyboardType="numeric"
									/>
								</View>
							</View>

							{/* Saving Type */}
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.text }]}>Saving Type *</Text>
								<SavingTypeSelector
									savingTypes={SAVING_TYPES}
									selectedType={selectedSavingType}
									onSelect={handleSavingTypeSelect}
								/>
							</View>

							{/* Description */}
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.text }]}>Description</Text>
								<TextInput
									style={[styles.textArea, { 
										backgroundColor: theme.card, 
										borderColor: theme.border,
										color: theme.text 
									}]}
									placeholder="Describe your savings goal..."
									placeholderTextColor={theme.textSecondary}
									value={formData.description}
									onChangeText={(value) => handleInputChange("description", value)}
									multiline
									numberOfLines={4}
									maxLength={200}
								/>
							</View>

							{/* Visibility */}
							<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: theme.text }]}>Visibility</Text>
								<VisibilityToggle
									visibility={formData.visibility}
									onChange={(visibility) => handleInputChange("visibility", visibility)}
								/>
							</View>

							{/* Add Members Button */}
							<View style={styles.inputGroup}>
								<TouchableOpacity
									style={[styles.addMembersButton, { backgroundColor: theme.card, borderColor: theme.border }]}
									onPress={handleOpenMembersSheet}
								>
									<View style={styles.addMembersContent}>
										<FontAwesome5 name="users" size={16} color={theme.textSecondary} />
										<Text style={[styles.addMembersText, { color: theme.text }]}>
											Add Group Members
										</Text>
									</View>
									<Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
								</TouchableOpacity>
							</View>

							{/* Selected Members Display */}
							<SelectedMembersDisplay
								members={formData.members}
								onRemoveMember={handleRemoveMember}
							/>
						</ScrollView>

						{/* Footer */}
						<View style={[styles.footer, { borderTopColor: theme.border }]}>
							<TouchableOpacity
								style={[
									styles.createButton,
									{
										backgroundColor: isFormValid && !isLoading ? theme.tint : theme.textSecondary,
										opacity: isLoading ? 0.7 : 1,
									},
								]}
								onPress={handleCreate}
								disabled={!isFormValid || isLoading}
							>
								{isLoading ? (
									<View style={styles.loadingContainer}>
										<Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
										<Text style={styles.createButtonText}>
											Creating...
										</Text>
									</View>
								) : (
									<Text style={styles.createButtonText}>
										Create Savings Group
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</View>

			{/* Add Group Members Sheet */}
			<AddGroupMembersSheet
				visible={showMembersSheet}
				onClose={() => setShowMembersSheet(false)}
				onConfirm={handleMembersConfirm}
				selectedContacts={formData.members}
			/>

			{/* Confirmation Modal */}
			{showConfirmation && createdGroupData && (
				<GroupCreationConfirmation
					visible={showConfirmation}
					groupData={createdGroupData}
					onClose={handleCloseConfirmation}
					savingTypes={SAVING_TYPES}
				/>
			)}
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
	keyboardAvoid: {
		flex: 1,
		justifyContent: "flex-end",
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
		fontSize: 20,
		fontWeight: "600",
	},
	closeButton: {
		padding: 4,
	},
	headerLine: {
		height: 1,
		marginTop: 16,
		marginHorizontal: 20,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	inputGroup: {
		marginBottom: 24,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
	},
	amountInput: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	currencySymbol: {
		fontSize: 18,
		fontWeight: "600",
		marginRight: 8,
	},
	amountTextInput: {
		flex: 1,
		fontSize: 18,
		fontWeight: "500",
	},
	textArea: {
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		minHeight: 100,
		textAlignVertical: "top",
	},
	addMembersButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	addMembersContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	addMembersText: {
		fontSize: 16,
		fontWeight: "500",
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderTopWidth: 1,
	},
	createButton: {
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	createButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	loadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	spinner: {
		width: 16,
		height: 16,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: 'transparent',
		borderTopColor: 'white',
		marginRight: 8,
	},
});

export default CreateSavingsGroupSheet; 