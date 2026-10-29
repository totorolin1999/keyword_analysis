import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import dayjs from 'dayjs';
import API_BASE_URL from '../apiConfig';

const baseURL = API_BASE_URL;

const getStoredTokens = () => {
    try {
        const item = localStorage.getItem('authTokens');
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

let authTokens = getStoredTokens();

const axiosInstance = axios.create({
    baseURL,
    headers: { Authorization: authTokens?.access ? `Bearer ${authTokens.access}` : '' }
});

axiosInstance.interceptors.request.use(async req => {
    authTokens = getStoredTokens();
    if (!authTokens?.access) {
        return req;
    }

    try {
        const user = jwtDecode(authTokens.access);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) {
            req.headers.Authorization = `Bearer ${authTokens.access}`;
            return req;
        }

        const response = await axios.post(`${baseURL}/api/token/refresh/`, {
            refresh: authTokens.refresh
        });

        const newTokens = {
            ...authTokens,
            ...response.data
        };

        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        authTokens = newTokens;
        req.headers.Authorization = `Bearer ${newTokens.access}`;
        return req;
    } catch (err) {
        console.error("Token refresh failed:", err);
        return req;
    }
});

export default axiosInstance;
