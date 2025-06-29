// import { useMemo } from "react";

// const getOtherParticipantName = useMemo((contacts: any, allUsers: any) => {
//     return (participants: string[]) => {
//         if (!participants || !Array.isArray(participants) || participants.length === 0) {
//             return 'Unknown';
//         }

//         const otherParticipantId = participants.find(id => id !== currentUser?.id);

//         if (!otherParticipantId) {
//             return 'Unknown';
//         }

//         const contact = contacts.find(c => c.userData?.id === otherParticipantId || c.userData?._id === otherParticipantId);
//         if (contact?.userData?.firstName) {
//             return contact?.name;
//         }
//         if (allUsers) {
//             const user = allUsers.find(u => u.id === otherParticipantId/* || u._id === otherParticipantId*/);
//             if (user?.firstName) {
//                 return user.firstName;
//             }
//         }

//         return otherParticipantId.charAt(0).toUpperCase();
//     };
// }, [contacts, allUsers, currentUser?.id]);