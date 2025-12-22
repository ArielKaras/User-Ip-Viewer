import { IpData, BuildMetadata } from '../types';
import { getClientId, isTrackingEnabled } from '../utils/clientId';

export const fetchIpData = async (): Promise<IpData> => {
    // ... existing ...
    try {
        const response = await fetch('/api/geo?precise=1');
        // ... existing ...
        const data = await response.json();
        return data as IpData;
    } catch (error) {
        console.error("Error fetching IP data:", error);
        throw error;
    }
};

export const trackVisit = async (data: IpData): Promise<void> => {
    if (!isTrackingEnabled()) return; // Privacy control

    try {
        await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Id': getClientId()
            },
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
    }
};

export const fetchHistory = async (): Promise<any[]> => {
    try {
        const response = await fetch('/api/history', {
            headers: { 'X-Client-Id': getClientId() }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return [];
    }
};

export const clearHistory = async (): Promise<void> => {
    try {
        await fetch('/api/history', {
            method: 'DELETE',
            headers: { 'X-Client-Id': getClientId() }
        });
    } catch (error) {
        console.error("Failed to clear history:", error);
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
