import axios from "axios";

// const API_BASE_URL = "https://1b970b89359c.ngrok-free.app/";
const API_BASE_URL = "https://backend-demo-2-k3mp.onrender.com/";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "ngrok-skip-browser-warning": "true",
    },
});

const request = async (method, endpoint, data = null, config = {}) => {
    try {
        const response = await axiosInstance({ method, url: endpoint, data, ...config });

        if (response.request?.responseType === 'blob' || config.responseType === 'blob') {
            const contentType = response.headers['content-type'];

            if (contentType?.includes('application/json')) {
                const text = await response.data.text();
                try {
                    const parsed = JSON.parse(text);
                    if (parsed?.error || parsed?.message) {
                        throw {
                            status: 400,
                            message: parsed.error || parsed.message || "Unknown error in blob response",
                        };
                    }
                } catch (e) {
                    console.error("error", e);
                    throw {
                        status: 400,
                        message: "Failed to parse blob error message",
                    };
                }
            }

            return response.data;
        }

        return response.data;

    } catch (error) {
        let errorMessage = "Unknown error occurred";
        let errorCode = 500;

        if (error.response?.status === 303) {
            const redirectUrl = error.response.headers['location'];
            if (redirectUrl) {
                try {
                    const redirectedResponse = await axiosInstance.get(redirectUrl, config);
                    return redirectedResponse.data;
                } catch (redirectError) {
                    throw {
                        status: redirectError.response?.status || 500,
                        message: redirectError.response?.data?.message || "Error following 303 redirect",
                    };
                }
            } else {
                throw {
                    status: 303,
                    message: "Redirect (303) received but no Location header found",
                };
            }
        }

        if (error.response) {
            errorCode = error.response.status;

            if (error.response.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const parsed = JSON.parse(text);
                    errorMessage = parsed?.error || parsed?.message || text;
                } catch (e) {
                    console.error("error", e);
                    errorMessage = "Unable to parse server response.";
                }
            } else {
                errorMessage = error.response?.data?.error || error.response?.data?.message || "Unknown server error";
            }

            if (errorCode === 400) errorMessage = `Bad Request: ${errorMessage}`;
            else if (errorCode === 401) errorMessage = `Unauthorized: ${errorMessage}`;
            else if (errorCode === 403) errorMessage = `Forbidden: ${errorMessage}`;
            else if (errorCode === 404) errorMessage = `Not Found: ${errorMessage}`;
            else if (errorCode === 500) errorMessage = `Internal Server Error: ${errorMessage}`;
            else if (errorCode === 503) errorMessage = `Service Unavailable: ${errorMessage}`;

        } else if (error.request) {
            errorMessage = "No response received from the server.";
            errorCode = 504;
        } else {
            errorMessage = error.message || "Unknown error occurred";
            errorCode = 500;
        }

        throw { status: errorCode, message: errorMessage };
    }
}

export const api = {
    get: (endpoint, config = {}) => request("get", endpoint, null, config),
    post: (endpoint, data, config = {}) =>
        request("post", endpoint, data, config),
    put: (endpoint, data, config = {}) => request("put", endpoint, data, config),
    patch: (endpoint, data, config = {}) =>
        request("patch", endpoint, data, config),
    delete: (endpoint, config = {}) => request("delete", endpoint, null, config),
};