import { SYSTEM_CONFIG } from "@/lib/config";

const API_URL = SYSTEM_CONFIG.app.apiBaseUrl;
const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const api = {
    // AUTH
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(credentials),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Login failed");
        }
        return res.json();
    },

    register: async (data: any) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Registration failed");
        }
        return res.json();
    },

    // CERTIFICATES
    getCertificates: async () => {
        const res = await fetch(`${API_URL}/certificates`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch certificates");
        return res.json();
    },

    createCertificate: async (data: any) => {
        const res = await fetch(`${API_URL}/certificates`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create certificate");
        return res.json();
    },

    deleteCertificate: async (id: number) => {
        const res = await fetch(`${API_URL}/certificates/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete certificate");
        return true;
    },

    updateCertificate: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/certificates/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update certificate");
        return res.json();
    },

    // DOCUMENTS
    getDocuments: async () => {
        const res = await fetch(`${API_URL}/documents`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch documents");
        return res.json();
    },

    createDocument: async (data: any) => {
        const res = await fetch(`${API_URL}/documents`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create document");
        return res.json();
    },

    deleteDocument: async (id: number) => {
        const res = await fetch(`${API_URL}/documents/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete document");
        return true;
    },

    // SEA TIME LOGS
    getSeaTimeLogs: async () => {
        const res = await fetch(`${API_URL}/seatimelogs`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch sea time logs");
        return res.json();
    },

    createSeaTimeLog: async (data: any) => {
        const res = await fetch(`${API_URL}/seatimelogs`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create sea time log");
        return res.json();
    },

    deleteSeaTimeLog: async (id: number) => {
        const res = await fetch(`${API_URL}/seatimelogs/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete sea time log");
        return true;
    },

    // PROFILE
    getProfile: async () => {
        const res = await fetch(`${API_URL}/profile`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
    },

    updateProfile: async (data: any) => {
        const res = await fetch(`${API_URL}/profile`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
    },
};
