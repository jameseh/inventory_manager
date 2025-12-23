import axios from "axios";

import { Item, Transaction } from "./types";

export interface ItemCreate {
    name: string;
    category?: string;
    description?: string;
    stock?: number;
    min_stock?: number;
    location?: string;
    image_url?: string;
    manufacturer_part_number?: string;
    attachments?: string[];
}

export interface ItemUpdate {
    name?: string;
    category?: string;
    description?: string;
    stock?: number;
    min_stock?: number;
    location?: string;
    image_url?: string;
    manufacturer_part_number?: string;
    attachments?: string[];
}

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getItems = async (query?: string): Promise<Item[]> => {
    const params = query ? { q: query } : {};
    const response = await api.get("/items", { params });
    return response.data;
};

export const getItem = async (id: number): Promise<Item> => {
    const response = await api.get(`/items/${id}`);
    return response.data;
};

export const createItem = async (data: ItemCreate): Promise<Item> => {
    const response = await api.post("/items", data);
    return response.data;
};

export const updateItem = async (id: number, data: ItemUpdate): Promise<Item> => {
    const response = await api.put(`/items/${id}`, data);
    return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getTransactions = async (skip: number = 0, limit: number = 50): Promise<Transaction[]> => {
    const response = await api.get("/transactions", { params: { skip, limit } });
    return response.data;
};

export const getCategories = async (): Promise<string[]> => {
    const response = await api.get("/categories");
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
};

export interface ProjectItem {
    id: number;
    project_id: number;
    item_id: number;
    quantity: number;
    item?: Item;
}

export interface Project {
    id: number;
    title: string;
    description?: string;
    status: "PLANNING" | "ACTIVE" | "COMPLETED";
    owner_id: number;
    created_at: string;
    updated_at: string;
    items: ProjectItem[];
}

export interface ProjectCreate {
    title: string;
    description?: string;
}

export interface ProjectItemCreate {
    item_id: number;
    quantity: number;
}

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get("/projects");
    return response.data;
};

export const getProject = async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (data: ProjectCreate): Promise<Project> => {
    const response = await api.post("/projects", data);
    return response.data;
};

export const addProjectItem = async (projectId: number, data: ProjectItemCreate): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/items`, data);
    return response.data;
};

export const updateProjectStatus = async (projectId: number, status: string, returnItems: boolean = false): Promise<Project> => {
    const response = await api.put(`/projects/${projectId}/status`, { status }, {
        params: { return_items: returnItems }
    });
    return response.data;
};

export default api;
