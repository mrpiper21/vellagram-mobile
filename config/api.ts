// API Configuration
const API_BASE_URL = "http://192.168.86.184:3000"; // Local development server
const prisma = 'http://192.168.86.184:3000'

export const API_ENDPOINTS = {
    OTP: {
        GENERATE: `${API_BASE_URL}/api/otp/generate`,
        VERIFY: `${API_BASE_URL}/api/otp/validate`
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/users/login`,
        REGISTER: `${API_BASE_URL}/api/users/signup`,
        ISREGISTERED: `${prisma}/api/users/check-phone`
    },
};