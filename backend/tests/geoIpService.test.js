const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { lookupGeo } = require('../src/services/geoIpService');

describe('GeoIpService', () => {
    let mock;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    afterAll(() => {
        mock.restore();
    });

    test('should return success with privacy default (no lat/lon)', async () => {
        // Mock ip-api response
        mock.onGet(/ip-api\.com/).reply(200, {
            status: 'success',
            country: 'Israel',
            regionName: 'Tel Aviv',
            city: 'Ramat Gan',
            lat: 32.0853,
            lon: 34.7818,
            query: '2.54.46.166'
        });

        const result = await lookupGeo('2.54.46.166');

        expect(result.ok).toBe(true);
        expect(result.ip).toBe('2.54.46.166');
        expect(result.country).toBe('Israel');
        expect(result.lat).toBeNull(); // Privacy default
        expect(result.lon).toBeNull();
        expect(result.source).toBe('ip-api.com');
    });

    test('should return lat/lon when precise=1 (includeLatLon=true)', async () => {
        mock.onGet(/ip-api\.com/).reply(200, {
            status: 'success',
            country: 'Israel',
            lat: 32.0853,
            lon: 34.7818,
            query: '2.54.46.166'
        });

        const result = await lookupGeo('2.54.46.166', { includeLatLon: true });

        expect(result.ok).toBe(true);
        expect(result.lat).toBe(32.0853);
        expect(result.lon).toBe(34.7818);
    });

    test('should return PRIVATE_IP error for local/private range without network call', async () => {
        const result = await lookupGeo('192.168.1.1');

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe('PRIVATE_IP');
        expect(mock.history.get.length).toBe(0); // Ensure no network call
    });

    test('should return PRIVATE_IP error if provider says "private range"', async () => {
        mock.onGet(/ip-api\.com/).reply(200, {
            status: 'fail',
            message: 'private range',
            query: '10.0.0.1'
        });

        const result = await lookupGeo('10.0.0.1'); // Normally caught by regex, but testing logic fallthrough

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe('PRIVATE_IP');
    });

    test('should return RATE_LIMITED error if provider says "rate limit"', async () => {
        mock.onGet(/ip-api\.com/).reply(200, {
            status: 'fail',
            message: 'rate limit exceeded',
            query: '1.2.3.4'
        });

        const result = await lookupGeo('1.2.3.4');

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe('RATE_LIMITED');
    });

    test('should return TIMEOUT error on network timeout', async () => {
        mock.onGet(/ip-api\.com/).timeout();

        const result = await lookupGeo('1.2.3.4');

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe('TIMEOUT');
    });

    test('should handle PROVIDER_FAIL on 500 status', async () => {
        mock.onGet(/ip-api\.com/).reply(500);

        const result = await lookupGeo('1.2.3.4');
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe('PROVIDER_FAIL');
    });
});
