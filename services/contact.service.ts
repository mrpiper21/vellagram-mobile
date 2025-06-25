import { API_ENDPOINTS } from "@/config/api";
import axios from "axios";

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