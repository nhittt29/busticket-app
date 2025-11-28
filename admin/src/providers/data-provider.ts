"use client";

import { DataProvider } from "@refinedev/core";
import api from "../lib/api";

export const dataProvider: DataProvider = {
    getList: async ({ resource, pagination, filters, sorters }) => {
        const { current = 1, pageSize = 10 } = (pagination as any) ?? {};
        const query: any = {
            page: current,
            limit: pageSize,
        };

        if (filters) {
            filters.map((filter) => {
                if (filter.operator === "eq") {
                    query[filter.field] = filter.value;
                }
                // Add more operators as needed
            });
        }

        if (sorters && sorters.length > 0) {
            query.sortBy = sorters[0].field;
            query.order = sorters[0].order;
        }

        // Map resource names to API endpoints if they differ
        const resourceMap: Record<string, string> = {
            "buses": "bus",
            // Add other mappings here if needed
        };
        const endpoint = resourceMap[resource] || resource;

        const { data } = await api.get(`/${endpoint}`, { params: query });

        return {
            data: data.data || data, // Adjust based on your API response structure
            total: data.total || data.length,
        };
    },

    getOne: async ({ resource, id }) => {
        const resourceMap: Record<string, string> = {
            "buses": "bus",
        };
        const endpoint = resourceMap[resource] || resource;
        const { data } = await api.get(`/${endpoint}/${id}`);
        return {
            data,
        };
    },

    create: async ({ resource, variables }) => {
        const resourceMap: Record<string, string> = {
            "buses": "bus",
        };
        const endpoint = resourceMap[resource] || resource;
        const { data } = await api.post(`/${endpoint}`, variables);
        return {
            data,
        };
    },

    update: async ({ resource, id, variables }) => {
        const resourceMap: Record<string, string> = {
            "buses": "bus",
        };
        const endpoint = resourceMap[resource] || resource;
        const { data } = await api.patch(`/${endpoint}/${id}`, variables);
        return {
            data,
        };
    },

    deleteOne: async ({ resource, id }) => {
        const resourceMap: Record<string, string> = {
            "buses": "bus",
        };
        const endpoint = resourceMap[resource] || resource;
        const { data } = await api.delete(`/${endpoint}/${id}`);
        return {
            data,
        };
    },

    getApiUrl: () => {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    },

    // Optional methods (can be implemented later)
    getMany: async () => { throw new Error("Not implemented"); },
    createMany: async () => { throw new Error("Not implemented"); },
    deleteMany: async () => { throw new Error("Not implemented"); },
    updateMany: async () => { throw new Error("Not implemented"); },
    custom: async () => { throw new Error("Not implemented"); },
};
