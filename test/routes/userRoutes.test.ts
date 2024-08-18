import express from 'express';
import request from 'supertest';
import userRouter from '../../src/routes/userRoutes';
import { describe } from 'node:test';

const app = express();
app.use('/', userRouter);
jest.mock('../../src/middleware/auth', () => ({
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
