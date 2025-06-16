import { API_ENDPOINTS } from "@/config/api"
import axios from "axios"

export const checkPhoneNumberRegisteration = async(phoneNumber: string) => {
    console.log("checking phone registerateion ------")
    try {
        const response = await axios.get(`${API_ENDPOINTS.AUTH.ISREGISTERED}/${phoneNumber}`)

        console.log(response.data.data.isResgistered)

        if(response.data.sucess && !response.data.data.isRegistered){
            return {
                isResgistered: response.data.data.isResgistered,
                data: response.data.data.message
            }
        }
        return {
            isResgistered: response.data.data.isResgistered,
            data: response.data.data.user
        }
    } catch(error: any) {
        console.log("error", error)
        throw error
    }
}