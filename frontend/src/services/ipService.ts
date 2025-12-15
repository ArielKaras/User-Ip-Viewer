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
