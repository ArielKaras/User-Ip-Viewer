import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchIpData, getEnvironmentMetadata } from './ipService';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('ipService', () => {

    describe('fetchIpData', () => {
        beforeEach(() => {
            fetchMock.mockClear();
        });

        it('should return IP data when API response is successful', async () => {
            const mockData = {
                success: true,
                ip: '1.2.3.4',
                city: 'Test City',
                // ... other fields irrelevant for this specific test
            };

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const result = await fetchIpData();
            expect(result.ip).toBe('1.2.3.4');
            expect(result.city).toBe('Test City');
            expect(fetchMock).toHaveBeenCalledWith('https://ipwho.is/');
        });

        it('should throw error when API returns unsuccessful status', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found',
            });

            await expect(fetchIpData()).rejects.toThrow('Network response was not ok');
        });

        it('should throw error when API returns success: false', async () => {
            const mockData = {
                success: false,
                message: 'Invalid IP',
            };

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            await expect(fetchIpData()).rejects.toThrow('Invalid IP');
        });
    });

    describe('getEnvironmentMetadata', () => {
        const originalLocation = window.location;

        beforeEach(() => {
            // @ts-ignore
            delete window.location;
            window.location = { hostname: '' } as Location;
        });

        afterEach(() => {
            window.location = originalLocation;
        });

        it('should return DEV for localhost', () => {
            window.location.hostname = 'localhost';
            expect(getEnvironmentMetadata()).toBe('DEV');
        });

        it('should return DEV for 127.0.0.1', () => {
            window.location.hostname = '127.0.0.1';
            expect(getEnvironmentMetadata()).toBe('DEV');
        });

        it('should return PROD for other domains', () => {
            window.location.hostname = 'example.com';
            expect(getEnvironmentMetadata()).toBe('PROD');
        });
    });
});
