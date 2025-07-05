// API Configuration
const API_BASE_URL = "http://172.20.10.8:2000"; // Local development server
const prisma = "http://172.20.10.8:2000";

export const API_ENDPOINTS = {
    OTP: {
        GENERATE: `${API_BASE_URL}/api/otp/generate`,
        VERIFY: `${API_BASE_URL}/api/otp/validate`
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/users/login`,
        REGISTER: `${API_BASE_URL}/api/users/signup`,
        ISREGISTERED: `${prisma}/api/users/check-phone`,
        ALLUSERS: `${prisma}/api/users/get-all-user`
    },
};


// export async function syncUnregisteredContacts() {
//   const contacts = useContactStore.getState().contacts;
//   const unregistered = contacts.filter(c => !c.isRegistered);
//   if (unregistered.length === 0) return;

//   const phoneNumbers = unregistered.map(c => c.phoneNumber);
//   const registeredNow = await checkContactsRegistration(phoneNumbers);

//   if (registeredNow.length > 0) {
//     useContactStore.getState().updateContactsRegistration(registeredNow);
//   }
// }

export async function checkContactsRegistration(phoneNumbers: string[]): Promise<string[]> {
  // Example API call (adjust endpoint as needed)
  const res = await fetch('/api/contacts/check-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumbers }),
  });
  const data = await res.json();
  return data.registered; // Adjust based on your API response
}