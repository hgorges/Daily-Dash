import bcrypt from 'bcrypt';
import knex from 'knex';
import { db } from '../server';

export type User = {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    home_gps: { x: number; y: number };
    work_gps: { x: number; y: number };
    created_at: Date;
    created_by: string;
    updated_at: Date;
    updated_by: string;
};

const userModel = {
    async createUser(user: User, password: string): Promise<string> {
        const salt = await bcrypt.genSalt();

        const persistedData = await knex('users')
            .insert({
                username: user.username.toLocaleLowerCase(),
                password: await this.hashPassword(password, salt),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                home_gps: {
                    x: user.home_gps.x,
                    y: user.home_gps.y,
                },
                work_gps: {
                    x: user.work_gps.x,
                    y: user.work_gps.y,
                },
                created_at: new Date(),
                created_by: 'system',
                updated_at: new Date(),
                updated_by: 'system',
            })
            .returning('user_id');

        return persistedData[0];
    },

    async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    },

    async getUserForLogin(
        username: string,
        password: string
    ): Promise<User | null> {
        const user = await db<User>('users')
            .where({ username: username.toLocaleLowerCase() })
            .first();

        if (!user) {
            return null;
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        return isValidPassword ? user : null;
    },

    async getUserById(user_id: string): Promise<User | undefined> {
        const result = await db<User>('users').where({ user_id }).first();
        return result;
    },

    async getUserByUsername(username: string): Promise<User | undefined> {
        const result = await db<User>('users')
            .where({ username: username.toLocaleLowerCase() })
            .first();
        return result;
    },
};

export default userModel;
