// API Configuration
const API_BASE_URL = "http://172.20.10.8:5001"; // Local development server

export const API_ENDPOINTS = {
    OTP: {
        GENERATE: `${API_BASE_URL}/api/otp/generate`,
        VERIFY: `${API_BASE_URL}/api/otp/verify`
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`
    }
};