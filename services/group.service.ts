import { API_ENDPOINTS } from "@/config/api"
import axios from "axios"

interface Props {
    name: string
    userIds: string[],
    token: string

}

export const CreateGroup = async({name, userIds, token}: Props) => {
    try{
        console.log("🔐 CreateGroup - Making API call with token:", token);
        console.log("🔐 CreateGroup - Request data:", {name, userIds});
        
        const response = await axios.post(API_ENDPOINTS.GROUP.CREATE, {name, userIds}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        
        console.log("🔐 CreateGroup - Response status:", response.status);
        console.log("🔐 CreateGroup - Response data:", response.data);
        
        if(response.status === 201){
            return response.data
        }
        return null
    } catch(error){
        console.error("❌ CreateGroup - Error:", error);
        if (axios.isAxiosError(error)) {
            console.error("❌ CreateGroup - Response status:", error.response?.status);
            console.error("❌ CreateGroup - Response data:", error.response?.data);
        }
        return null
    }
}