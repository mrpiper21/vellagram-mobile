import { useContactStore } from "@/store/useContactStore";
import * as Contacts from "expo-contacts";

class ContactBackgroundService {
    private static instance: ContactBackgroundService;
    private syncInterval: ReturnType<typeof setInterval> | null = null;
    private isInitialized = false;

    private constructor() {}

    static getInstance(): ContactBackgroundService {
        if (!ContactBackgroundService.instance) {
            ContactBackgroundService.instance = new ContactBackgroundService();
        }
        return ContactBackgroundService.instance;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Request permissions
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Contact permissions not granted');
                return;
            }

            this.isInitialized = true;
            console.log('Contact background service initialized');
        } catch (error) {
            console.error('Error initializing contact background service:', error);
        }
    }

    async startBackgroundSync(intervalMinutes: number = 30) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Stop existing sync if running
        this.stopBackgroundSync();

        // Start new sync interval
        this.syncInterval = setInterval(async () => {
            await this.syncContacts();
        }, intervalMinutes * 60 * 1000);

        // Initial sync
        await this.syncContacts();
    }

    stopBackgroundSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async syncContacts() {
        if (!this.isInitialized) return;

        console.log("🔄 ContactBackgroundService: Starting contact sync...");

        try {
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.Name,
                    Contacts.Fields.Image,
                ],
            });

            console.log("📱 ContactBackgroundService: Found", data.length, "device contacts");

            if (data.length > 0) {
                const contactStore = useContactStore.getState();
                const phoneNumbers: string[] = [];
                const newContacts: any[] = [];
                const unregisteredContacts: string[] = [];

                // Extract phone numbers from contacts
                data.forEach(contact => {
                    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                        contact.phoneNumbers.forEach(phone => {
                            if (phone.number) {
                                const cleanPhone = phone.number.replace(/\D/g, '');
                                if (cleanPhone.length >= 10) { // Basic validation
                                    phoneNumbers.push(cleanPhone);
                                    
                                    // Check if contact already exists in store
                                    const existingContact = contactStore.getContactByPhone(cleanPhone);
                                    
                                    if (!existingContact) {
                                        // New contact - add to store and mark for checking
                                        newContacts.push({
                                            id: contact.id || cleanPhone,
                                            phoneNumber: cleanPhone,
                                            name: contact.name || undefined,
                                            avatar: contact.image?.uri || undefined,
                                            isRegistered: false, // Will be checked
                                            userData: undefined,
                                        });
                                        unregisteredContacts.push(cleanPhone);
                                    } else if (!existingContact.isRegistered) {
                                        // Existing contact but not registered - check again
                                        unregisteredContacts.push(cleanPhone);
                                    } else {
                                        // Already registered - skip
                                        console.log("✅ Skipping already registered contact:", cleanPhone);
                                    }
                                }
                            }
                        });
                    }
                });

                // Add new contacts to store in batch
                if (newContacts.length > 0) {
                    console.log("📱 ContactBackgroundService: Adding", newContacts.length, "new contacts to store");
                    newContacts.forEach(contact => contactStore.addContact(contact));
                }

                console.log("📱 ContactBackgroundService: Total phone numbers found:", phoneNumbers.length);
                console.log("📱 ContactBackgroundService: New contacts to check:", unregisteredContacts.length);
                console.log("📱 ContactBackgroundService: Already registered contacts:", phoneNumbers.length - unregisteredContacts.length);

                // Only check unregistered contacts
                if (unregisteredContacts.length > 0) {
                    console.log("🚀 ContactBackgroundService: Starting background registration check for unregistered contacts...");
                    await this.checkContactsInBatches(unregisteredContacts);
                } else {
                    console.log("✅ ContactBackgroundService: All contacts are already registered or checked recently");
                }
            }
        } catch (error) {
            console.error('❌ ContactBackgroundService: Error syncing contacts:', error);
        }
    }

    private async checkContactsInBatches(phoneNumbers: string[], batchSize: number = 5) {
        const contactStore = useContactStore.getState();
        const totalBatches = Math.ceil(phoneNumbers.length / batchSize);
        
        console.log(`🔄 ContactBackgroundService: Checking ${phoneNumbers.length} contacts in ${totalBatches} batches of ${batchSize}`);
        
        for (let i = 0; i < phoneNumbers.length; i += batchSize) {
            const batch = phoneNumbers.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            
            console.log(`📱 ContactBackgroundService: Processing batch ${batchNumber}/${totalBatches} with ${batch.length} contacts`);
            
            // Process batch in parallel with individual delays
            const promises = batch.map(async (phoneNumber, index) => {
                // Add small delay between each API call in the batch
                await new Promise(resolve => setTimeout(resolve, index * 200));
                return contactStore.checkContactRegistration(phoneNumber);
            });
            
            await Promise.all(promises);
            
            // Add delay between batches to be respectful to the API
            if (i + batchSize < phoneNumbers.length) {
                console.log("⏳ ContactBackgroundService: Waiting between batches...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log("✅ ContactBackgroundService: Background registration check completed");
    }

    async checkSpecificContact(phoneNumber: string) {
        if (!this.isInitialized) return false;

        const contactStore = useContactStore.getState();
        return await contactStore.checkContactRegistration(phoneNumber);
    }

    // Check multiple specific contacts (useful for manual contact addition)
    async checkSpecificContacts(phoneNumbers: string[]) {
        if (!this.isInitialized) return;

        console.log("🔄 ContactBackgroundService: Checking specific contacts:", phoneNumbers.length);
        await this.checkContactsInBatches(phoneNumbers);
    }

    async getDeviceContacts() {
        if (!this.isInitialized) return [];

        try {
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.Name,
                    Contacts.Fields.Image,
                ],
            });

            return data.filter(contact => 
                contact.phoneNumbers && contact.phoneNumbers.length > 0
            );
        } catch (error) {
            console.error('Error getting device contacts:', error);
            return [];
        }
    }

    isRunning(): boolean {
        return this.syncInterval !== null;
    }

    // New method to check only unregistered contacts from store
    async checkUnregisteredContacts() {
        if (!this.isInitialized) return;

        console.log("🔄 ContactBackgroundService: Checking unregistered contacts from store...");
        
        const contactStore = useContactStore.getState();
        const unregisteredContacts = contactStore.getUnregisteredContactsToCheck();
        
        if (unregisteredContacts.length > 0) {
            console.log("📱 ContactBackgroundService: Found", unregisteredContacts.length, "unregistered contacts to check");
            await this.checkContactsInBatches(unregisteredContacts);
        } else {
            console.log("✅ ContactBackgroundService: No unregistered contacts to check");
        }
    }
}

export default ContactBackgroundService; 