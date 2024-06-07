import bcrypt from "bcrypt";
import pool from "../config/db";

const userModel = {
    async createUser(
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        email: string
    ) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = /* sql */ `
            INSERT INTO "users" ("username", "password", "first_name", "last_name", "email")
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const values = [username, hashedPassword, firstName, lastName, email];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async getUserByUsername(username: string) {
        const query = /* sql */ `SELECT * FROM "users" WHERE "username" = $1`;
        const values = [username];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async getUserById(userId: number) {
        const query = /* sql */ `SELECT * FROM users WHERE id = $1`;
        const values = [userId];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },
};

export default userModel;
