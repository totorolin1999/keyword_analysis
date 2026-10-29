import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import dayjs from 'dayjs';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';

const baseURL = API_BASE_URL;

const useAxios = () => {
    const { authTokens, setUser, setAuthTokens, logoutUser } = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: authTokens?.access ? `Bearer ${authTokens.access}` : '' }
    });

    axiosInstance.interceptors.request.use(async req => {
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
            setAuthTokens(newTokens);
            setUser(jwtDecode(newTokens.access));

            req.headers.Authorization = `Bearer ${newTokens.access}`;
            return req;
        } catch (error) {
            console.error("Token refresh failed in useAxios:", error);
            if (logoutUser) {
                logoutUser();
            }
            return req;
        }
    });

    return axiosInstance;
};

export default useAxios;
