// Utility functions for conversation-related operations

export interface ParticipantDetails {
	name: string;
	id: string | null;
	profile: string | null;
}

/**
 * Get details of the other participant in a conversation
 * @param participants - Array of participant IDs
 * @param currentUserId - Current user's ID
 * @param contacts - Array of contacts from contact store
 * @param allUsers - Array of all users from context
 * @returns ParticipantDetails object with name, id, and profile
 */
export const getOtherParticipantDetails = (
	participants: string[] | string,
	currentUserId: string | undefined,
	contacts: any[],
	allUsers: any[]
): ParticipantDetails => {
	console.log('🔍 getOtherParticipantDetails called with:', {
		participants,
		currentUserId,
		contactsCount: contacts?.length,
		allUsersCount: allUsers?.length
	});

	let name = "";
	let id: string | null = null;
	let profile: string | null = null;

	if (!participants) {
		console.log('❌ No participants found');
		return { name: 'Unknown', id: null, profile: null };
	}

	let otherParticipantId: string | undefined;

	if (Array.isArray(participants)) {
		if (participants.length === 0) {
			console.log('❌ Empty participants array');
			return { name: 'Unknown', id: null, profile: null };
		}
		otherParticipantId = participants.find(id => id !== currentUserId);
	} else {
		otherParticipantId = participants;
	}

	console.log('🔍 Other participant ID:', otherParticipantId);
	
	if (!otherParticipantId) {
		console.log('❌ No other participant found');
		return { name: 'Unknown', id: null, profile: null };
	}

	const contact = contacts.find(c => {
		const contactUserId = c.userData?.id || c.userData?._id;
		const matches = contactUserId === otherParticipantId;
		if (matches) {
			console.log('✅ Found contact in phone book:', c);
		}
		return matches;
	});

	if (contact) {
		const contactName = contact.name;
		if (contactName) {
			console.log('✅ Using phone contact name:', contactName);
			name = contactName;
			id = contact.userData?.id || contact.userData?._id;
		}
	}

	if (allUsers && allUsers.length > 0) {
		const user = allUsers.find(u => {
			const userId = u.id || u._id;
			const matches = userId === otherParticipantId;
			if (matches) {
				console.log('✅ Found user in allUsers:', u);
			}
			return matches;
		});
		
		if (user) {
			// Only use user name if we don't have a phone contact name
			if (!name) {
				const userName = user.firstName + " " + user.lastName;
				if (userName.trim()) {
					console.log('✅ Using user name from allUsers as fallback:', userName);
					name = userName;
				}
			}
			
			if (user?.profilePicture) {
				console.log('✅ Using profile image from allUsers:', user.profilePicture);
				profile = user.profilePicture;
			}
			
			if (!id) {
				id = user.id || user._id;
			}
		}
	}

	// Final fallback
	if (!name) {
		console.log('⚠️ Using fallback name for ID:', otherParticipantId);
		name = 'Unknown';
	}

	return {
		name,
		id,
		profile
	};
};

/**
 * Get just the name of the other participant (simplified version for conversation list)
 * @param participants - Array of participant IDs
 * @param currentUserId - Current user's ID
 * @param contacts - Array of contacts from contact store
 * @param allUsers - Array of all users from context
 * @returns string - The participant's name
 */
// export const getOtherParticipantName = (
// 	participants: string[],
// 	currentUserId: string | undefined,
// 	contacts: any[],
// 	allUsers: any[]
// ): ParticipantDetails => {
// 	return getOtherParticipantDetails(participants, currentUserId, contacts, allUsers).name;
// };

/**
 * Get conversation display name (for groups or individual chats)
 * @param conversation - Conversation object
 * @param currentUserId - Current user's ID
 * @param contacts - Array of contacts from contact store
 * @param allUsers - Array of all users from context
 * @returns string - The conversation display name
 */
// export const getConversationDisplayName = (
// 	conversation: any,
// 	currentUserId: string | undefined,
// 	contacts: any[],
// 	allUsers: any[]
// ): string => {
// 	console.log('🔍 getConversationDisplayName called with:', {
// 		conversationId: conversation?.id,
// 		isGroup: conversation?.isGroup,
// 		participants: conversation?.participants,
// 		currentUserId
// 	});

// 	if (conversation?.isGroup) {
// 		const groupName = conversation.groupName || 'Group';
// 		console.log('✅ Using group name:', groupName);
// 		return groupName;
// 	}
	
// 	const name = getOtherParticipantName(conversation?.participants, currentUserId, contacts, allUsers);
// 	console.log('✅ Using participant name:', name);
// 	return name;
// }; 