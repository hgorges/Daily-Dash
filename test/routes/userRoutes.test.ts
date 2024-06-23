import express from 'express';
import request from 'supertest';
import router from '../../src/routes/userRoutes';

const app = express();
app.use('/', router);
jest.mock('../../src/middleware/authMiddleware', () => ({
    checkAuthentication: (_req: any, _res: any, next: any) => {
        next();
    },
}));

describe('User Routes', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('successfully calls /users', async () => {
        const expectedResponse = { result: 'working' };

        const actualResponse = await request(app).get('/users');

        expect(actualResponse.statusCode).toBe(200);
        expect(actualResponse.body).toEqual(expectedResponse);
    });
});
