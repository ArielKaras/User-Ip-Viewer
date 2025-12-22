export interface IpData {
    ip: string;
    country?: string;
    region?: string;
    region_code?: string;
    city?: string;
    lat?: number;
    lon?: number;
    latitude: number; // For compatibility with IpCard (mapped to lat in UI or backend)
    longitude: number; // For compatibility with IpCard
    connection: {
        isp: string;
    };
    timezone: {
        name: string;
        current_time: string;
    };
    source?: string;
    timestamp?: string;
}

export * from './observability';
