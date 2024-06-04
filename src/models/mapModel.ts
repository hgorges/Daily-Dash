import pool from "../config/db";

const mapModel = {
    async getMapDataByUsername(username: string) {
        const query = /* sql */ `
            SELECT "header", "iframe_data"
            FROM "user_map" "userMap"
            JOIN "users" "user" USING ("user_id")
            WHERE "user"."username" = $1
        `;
        const values = [username];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },
};

export default mapModel;
