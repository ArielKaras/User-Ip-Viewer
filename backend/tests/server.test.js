const request = require('supertest');
const axios = require('axios');
const app = require('../server');

jest.mock('axios');

describe('GET /api/ip', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return the public IP when external API is successful', async () => {
        const mockIp = '123.45.67.89';
        axios.get.mockResolvedValue({ data: { ip: mockIp } });

        const res = await request(app).get('/api/ip');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ ip: mockIp });
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should return 500 error when external API fails', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));

        const res = await request(app).get('/api/ip');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ ip: 'Error fetching server IP' });
        expect(axios.get).toHaveBeenCalledTimes(1);
    });
});
