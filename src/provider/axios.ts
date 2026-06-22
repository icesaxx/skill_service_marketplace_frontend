import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Create Axios instance
const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = Cookies.get("ssm_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            toast.error("Error encrypting API key");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 🔹 Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || "An error occurred";
            const errMessageArray = error.response.data?.errors || []; // Ensure it's an array
            // Convert array to a string (comma-separated)
            const errDescription = Array.isArray(errMessageArray)
                ? errMessageArray.join(", ")
                : errMessageArray;

            switch (status) {
                case 400:
                    toast.error("Bad Request", {
                        description: errDescription || message,
                    });
                    break;
                case 401:
                    unAuthorized();
                    break;
                case 403:
                    toast.error("Access Denied", {
                        description: "You do not have permission to perform this action.",
                    });
                    break;
                case 404:
                    //useErrorStore.getState().triggerNotFound(message);
                    break;
                case 409:
                    toast.error(message);
                    break;
                case 422:
                    toast.error("Error", {
                        description: errDescription || "Unprocessable Entity",
                    });
                    break;
                case 500:
                    toast.error("Server Error", {
                        description: errDescription || "Something went wrong.",
                    });
                    break;
                default:
                    toast.error("Unexpected Error", {
                        description: errDescription || `An error occurred (${status}).`,
                    });
                    break;
            }
        } else {
            toast.error("Unable to connect to the server. Please try again later.");
        }
        return Promise.reject(error);
    }
);


const unAuthorized = () => {
    Cookies.set("ssm_token", "", { expires: 0 });
    window.location.href = "/";
    toast.error("Unauthorized. Please log in again.");
};

export default api;
