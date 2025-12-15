import { IpData, BuildMetadata } from '../types';

export const fetchIpData = async (): Promise<IpData> => {
    try {
        // Call our own Backend-for-Frontend (BFF) endpoint
        // This includes IP resolution + Geo lookup in one safe call
        const response = await fetch('/api/geo?precise=1');

        if (!response.ok) {
            throw new Error(`Service unavailable: ${response.statusText}`);
        }

        const data = await response.json();

        // Backend returns { ok: boolean, ... }
        // We can pass it through directly as it matches IpData interface now
        return data as IpData;
    } catch (error) {
        console.error("Error fetching IP data:", error);
        throw error;
    }
};

export const trackVisit = async (data: IpData): Promise<void> => {
    try {
        await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ip: data.ip,
                city: data.city || 'Unknown',
                country: data.country || 'Unknown',
                latitude: data.lat || 0,
                longitude: data.lon || 0
            })
        });
    } catch (error) {
        console.error("Failed to track visit:", error);
        // Fail silently to not disrupt UI
    }
};

export const fetchHistory = async (): Promise<any[]> => {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return [];
    }
};

export const getEnvironmentMetadata = (): 'DEV' | 'PROD' => {
    const hostname = window.location.hostname;
    if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.includes('sandbox') ||
        hostname.includes('preview')
    ) {
        return 'DEV';
    }
    return 'PROD';
};

export const fetchBuildMetadata = async (): Promise<Partial<BuildMetadata>> => {
    try {
        const response = await fetch('/api/version');
        if (!response.ok) return {};
        const data = await response.json();
        return {
            commitSha: data.commit,
            timestamp: data.timestamp
        };
    } catch (error) {
        console.error("Error fetching build metadata:", error);
        return {};
    }
};
