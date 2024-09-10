import bcrypt from 'bcrypt';
import { db } from '../server';

export type User = {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_admin: boolean;
    password: string;
    password_reset_token: string | null;
    password_reset_token_expiration: Date | null;
    home_gps: { x: number; y: number };
    work_gps: { x: number; y: number };
    calendars: string[];
    locale: string;
    time_zone: string;
    created_at: Date;
    created_by: string;
    updated_at: Date;
    updated_by: string;
    is_approved: boolean;
};

const userModel = {
    async createUser(
        username: string,
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        createdBy: string | null,
    ): Promise<string> {
        const salt = await bcrypt.genSalt();

        const persistedData = await db('users')
            .insert({
                username: username,
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: await this.hashPassword(password, salt),
                home_gps: null,
                work_gps: null,
                created_at: new Date(),
                created_by: createdBy ?? 'system',
                updated_at: new Date(),
                updated_by: createdBy ?? 'system',
            })
            .returning('user_id');

        return persistedData[0];
    },

    async updateUser(
        username: string,
        username_changed: string,
        first_name: string,
        last_name: string,
        password: string | null,
        changed_password: string | null,
    ): Promise<string | null> {
        if (
            password != null &&
            password.length > 7 &&
            password === changed_password
        ) {
            const salt = await bcrypt.genSalt();

            const persistedData = await db('users')
                .update({
                    password: await this.hashPassword(password, salt),
                    updated_at: new Date(),
                    updated_by: username,
                })
                .where({ username })
                .returning('user_id');

            return persistedData[0];
        }

        const persistedData = await db('users')
            .update({
                username: username_changed,
                first_name,
                last_name,
                updated_at: new Date(),
                updated_by: username,
            })
            .where({ username })
            .returning('user_id');

        return persistedData[0];
    },

    async updateUserData(
        username: string,
        email: string,
        home_gps: { x: number; y: number },
        work_gps: { x: number; y: number },
        calendars: string,
        locale: string,
        time_zone: string,
    ): Promise<string> {
        const persistedData = await db('users')
            .update({
                email,
                home_gps: '(' + home_gps.x + ',' + home_gps.y + ')',
                work_gps: '(' + work_gps.x + ',' + work_gps.y + ')',
                calendars: '{' + calendars + '}',
                locale,
                time_zone,
                updated_at: new Date(),
                updated_by: username,
            })
            .where({ username })
            .returning('user_id');

        return persistedData[0];
    },

    async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    },

    async getUsersByApprovalState(
        is_approved: boolean,
    ): Promise<User[] | undefined> {
        return db<User>('users').where({ is_approved });
    },

    async getUserForLogin(
        username: string,
        password: string,
    ): Promise<User | null> {
        const user = await db<User>('users')
            .where({ username: username })
            .first();

        if (!user) {
            return null;
        }
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return null;
        }

        db('users').update({
            password_reset_token: null,
            password_reset_token_expiration: null,
        });

        return user;
    },

    async getUserByEmail(email: string): Promise<User | undefined> {
        return db<User>('users').where({ email }).first();
    },

    async getUserByUsername(username: string): Promise<User | undefined> {
        return db<User>('users').where({ username: username }).first();
    },

    async getUserByValidPasswordResetToken(
        passwordResetToken: string,
    ): Promise<User | undefined> {
        return db<User>('users')
            .where('password_reset_token', passwordResetToken)
            .where('password_reset_token_expiration', '>', new Date())
            .first();
    },

    async changePassword(username: string, password: string): Promise<void> {
        const salt = await bcrypt.genSalt();
        await db('users')
            .update({
                password: await this.hashPassword(password, salt),
                password_reset_token: null,
                password_reset_token_expiration: null,
                updated_at: new Date(),
                updated_by: username,
            })
            .where({ username })
            .where('password_reset_token', 'IS NOT', null)
            .where('password_reset_token_expiration', '>', new Date());
    },

    async setPasswordResetTokenForUser(
        username: string,
        randomUuid: `${string}-${string}-${string}-${string}-${string}`,
    ): Promise<void> {
        await db('users')
            .update({
                password_reset_token: randomUuid,
                password_reset_token_expiration: new Date(Date.now() + 3600000),
            })
            .where({
                username,
            })
            .andWhere(function () {
                this.where({
                    password_reset_token: null,
                    password_reset_token_expiration: null,
                }).orWhere('password_reset_token_expiration', '<', new Date());
            });
    },

    async updateUserApprovalStatus(
        user_id: string,
        is_approved: boolean,
    ): Promise<void> {
        await db('users').update({ is_approved }).where({ user_id });
    },
};

export default userModel;
