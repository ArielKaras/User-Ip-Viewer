export const getClientId = (): string => {
    const STORAGE_KEY = 'uiv_client_id';
    let clientId = localStorage.getItem(STORAGE_KEY);

    if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, clientId);
    }

    return clientId;
};

export const isTrackingEnabled = (): boolean => {
    const enabled = localStorage.getItem('uiv_tracking_enabled');
    // Default to true
    return enabled !== 'false';
};

export const setTrackingEnabled = (enabled: boolean): void => {
    localStorage.setItem('uiv_tracking_enabled', String(enabled));
};
