import { SYSTEM_CONFIG } from "@/lib/config";

const API_URL = SYSTEM_CONFIG.app.apiBaseUrl;
const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export interface Category {
    id: number;
    label: string;
    color: string;
    icon: string;
    pattern?: string;
    is_system: boolean;
}

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

    getCertificate: async (id: number) => {
        const res = await fetch(`${API_URL}/certificates/${id}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch certificate");
        return res.json();
    },

    createCertificate: async (data: any) => {
        const res = await fetch(`${API_URL}/certificates`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            console.error("Certificate creation failed", error);
            throw new Error(error.detail || "Failed to create certificate");
        }
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
    getDocuments: async (archived: boolean = false) => {
        const res = await fetch(`${API_URL}/documents?archived=${archived}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch documents");
        return res.json();
    },

    getDocument: async (id: number) => {
        const res = await fetch(`${API_URL}/documents/${id}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch document");
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

    archiveDocument: async (id: number, archived: boolean) => {
        const res = await fetch(`${API_URL}/documents/${id}/archive?archived=${archived}`, {
            method: "PATCH",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to update archive status");
        return res.json();
    },

    updateDocument: async (id: number, updates: any) => {
        const res = await fetch(`${API_URL}/documents/${id}`, {
            method: "PATCH",
            headers: {
                ...getHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Failed to update document");
        return res.json();
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

    updateSeaTimeLog: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/seatimelogs/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update sea time log");
        return res.json();
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

    // Categories
    getCategories: async (scope: string = "document"): Promise<Category[]> => {
        const response = await fetch(`${API_URL}/categories?scope=${scope}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        return response.json();
    },

    createCategory: async (data: { label: string; color: string; icon: string; pattern?: string; scope?: string }) => {
        const response = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create category");
        return response.json();
    },

    updateCategory: async (id: number, data: { label?: string; color?: string; icon?: string }) => {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update category");
        return response.json();
    },

    deleteCategory: async (id: number) => {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Failed to delete category");
        return response.json();
    },

    // RESUME DRAFTS
    getResumeDrafts: async () => {
        const res = await fetch(`${API_URL}/resumes`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch resume drafts");
        return res.json();
    },

    getResumeDraft: async (id: number) => {
        const res = await fetch(`${API_URL}/resumes/${id}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch resume draft");
        return res.json();
    },

    createResumeDraft: async (data: any) => {
        const res = await fetch(`${API_URL}/resumes`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create resume draft");
        return res.json();
    },

    updateResumeDraft: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/resumes/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update resume draft");
        return res.json();
    },

    deleteResumeDraft: async (id: number) => {
        const res = await fetch(`${API_URL}/resumes/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete resume draft");
        return true;
    },

    // DASHBOARD
    getDashboardSummary: async () => {
        const res = await fetch(`${API_URL}/dashboard/summary`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        return res.json();
    },
};
