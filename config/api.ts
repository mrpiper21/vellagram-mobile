// API Configuration
const API_BASE_URL = "http://192.168.87.50:5001"; // Local development server

export const API_ENDPOINTS = {
    OTP: {
        GENERATE: `${API_BASE_URL}/api/otp/generate`,
        VERIFY: `${API_BASE_URL}/api/otp/verify`
    },
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/users/login`,
        REGISTER: `${API_BASE_URL}/api/users/register`
    }
};