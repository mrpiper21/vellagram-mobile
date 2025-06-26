import { API_ENDPOINTS } from "@/config/api";
import { useContactStore } from '@/store/useContactStore';
import axios from "axios";
import { debounce } from 'lodash';

export const checkPhoneNumberRegisteration = async(phoneNumber: string) => {
    console.log("🔍 Checking phone registration for:", phoneNumber);
    try {
        const response = await axios.get(`${API_ENDPOINTS.AUTH.ISREGISTERED}/${phoneNumber}`)

        console.log("📱 Registration response:", response.data);

        if(response.data.success && !response.data.data.isRegistered){
            return {
                isResgistered: response.data.data.isRegistered,
                data: response.data.data.message
            }
        }
        return {
            isResgistered: response.data.data.isRegistered,
            data: response.data.data.user
        }
    } catch(error: any) {
        console.error("❌ Error checking phone registration:", error);
        throw error
    }
}

// Example: when a user selects or searches for a contact
async function handleContactSearch(phoneNumber: string) {
  // Optionally, show a loading indicator here
  const isRegistered = await useContactStore.getState().checkContactRegistration(phoneNumber);
  // Optionally, update UI or show a badge based on isRegistered
}

const debouncedCheck = debounce((phoneNumber: string) => {
  if (phoneNumber && phoneNumber.length >= 7) {
    useContactStore.getState().checkContactRegistration(phoneNumber);
  }
}, 500);

// In your search input handler:
function onSearchInputChange(text: string) {
  debouncedCheck(text);
}

