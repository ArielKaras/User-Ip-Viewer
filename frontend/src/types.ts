export interface IpData {
    ok: boolean;
    ip: string;
    country: string | null;
    region: string | null;
    city: string | null;
    lat: number | null;
    lon: number | null;
    source: string;
    timestamp: string;
    // Optional UI fields (if we decide to add them later)
    timezone?: string;
    isp?: string;
    org?: string;
}

export interface BuildMetadata {
    env: 'DEV' | 'PROD';
    commitSha: string;
    timestamp: string;
}
