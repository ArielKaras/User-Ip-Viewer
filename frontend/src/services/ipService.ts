import { IpData, BuildMetadata } from '../types';

export const fetchIpData = async (): Promise<IpData> => {
    try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to retrieve IP data');
        }
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
                city: data.city,
                country: data.country,
                latitude: data.latitude,
                longitude: data.longitude
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
