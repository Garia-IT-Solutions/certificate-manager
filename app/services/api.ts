
import { SYSTEM_CONFIG } from "@/lib/config";

const API_URL = SYSTEM_CONFIG.app.apiBaseUrl;

export const api = {
    // CERTIFICATES
    getCertificates: async () => {
        const res = await fetch(`${API_URL}/certificates`);
        if (!res.ok) throw new Error("Failed to fetch certificates");
        return res.json();
    },

    createCertificate: async (data: any) => {
        const res = await fetch(`${API_URL}/certificates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create certificate");
        return res.json();
    },

    deleteCertificate: async (id: number) => {
        const res = await fetch(`${API_URL}/certificates/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete certificate");
        return true;
    },

    // DOCUMENTS
    getDocuments: async () => {
        const res = await fetch(`${API_URL}/documents`);
        if (!res.ok) throw new Error("Failed to fetch documents");
        return res.json();
    },

    createDocument: async (data: any) => {
        const res = await fetch(`${API_URL}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create document");
        return res.json();
    },

    deleteDocument: async (id: number) => {
        const res = await fetch(`${API_URL}/documents/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete document");
        return true;
    },

    // SEA TIME LOGS
    getSeaTimeLogs: async () => {
        const res = await fetch(`${API_URL}/seatimelogs`);
        if (!res.ok) throw new Error("Failed to fetch sea time logs");
        return res.json();
    },

    createSeaTimeLog: async (data: any) => {
        const res = await fetch(`${API_URL}/seatimelogs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create sea time log");
        return res.json();
    },

    deleteSeaTimeLog: async (id: number) => {
        const res = await fetch(`${API_URL}/seatimelogs/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete sea time log");
        return true;
    },

    // PROFILE
    getProfile: async () => {
        const res = await fetch(`${API_URL}/profile`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
    },

    updateProfile: async (data: any) => {
        const res = await fetch(`${API_URL}/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
    },
};
