// import { useContactStore } from "@/store/useContactStore";
// import * as Contacts from "expo-contacts";

// class ContactBackgroundService {
//     private static instance: ContactBackgroundService;
//     private syncInterval: ReturnType<typeof setInterval> | null = null;
//     private isInitialized = false;

//     private constructor() {}

//     static getInstance(): ContactBackgroundService {
//         if (!ContactBackgroundService.instance) {
//             ContactBackgroundService.instance = new ContactBackgroundService();
//         }
//         return ContactBackgroundService.instance;
//     }

//     async initialize() {
//         if (this.isInitialized) return;

//         try {
//             // Request permissions
//             const { status } = await Contacts.requestPermissionsAsync();
//             if (status !== 'granted') {
//                 console.log('Contact permissions not granted');
//                 return;
//             }

//             this.isInitialized = true;
//             console.log('Contact background service initialized');
//         } catch (error) {
//             console.error('Error initializing contact background service:', error);
//         }
//     }

//     async startBackgroundSync(intervalMinutes: number = 30) {
//         if (!this.isInitialized) {
//             await this.initialize();
//         }

//         // Stop existing sync if running
//         this.stopBackgroundSync();

//         // Start new sync interval
//         this.syncInterval = setInterval(async () => {
//             await this.syncContacts();
//         }, intervalMinutes * 60 * 1000);

//         // Initial sync
//         await this.syncContacts();
//     }

//     stopBackgroundSync() {
//         if (this.syncInterval) {
//             clearInterval(this.syncInterval);
//             this.syncInterval = null;
//         }
//     }


//     // Check multiple specific contacts (useful for manual contact addition)

//     async getDeviceContacts() {
//         if (!this.isInitialized) return [];

//         try {
//             const { data } = await Contacts.getContactsAsync({
//                 fields: [
//                     Contacts.Fields.PhoneNumbers,
//                     Contacts.Fields.Name,
//                     Contacts.Fields.Image,
//                 ],
//             });

//             return data.filter(contact => 
//                 contact.phoneNumbers && contact.phoneNumbers.length > 0
//             );
//         } catch (error) {
//             console.error('Error getting device contacts:', error);
//             return [];
//         }
//     }

//     isRunning(): boolean {
//         return this.syncInterval !== null;
//     }

//     // New method to check only unregistered contacts from store
// }

// export default ContactBackgroundService; 