import pool from "../config/db";
import { TodoistApi } from "@doist/todoist-api-typescript";

const todoModel = {
    getApi(apiKey: string) {
        return new TodoistApi(apiKey);
    },
    async getApiKey(username: string) {
        const query = /* sql */ `SELECT "todoist_api_key" FROM "users" WHERE "username" = $1`;
        const values = [username];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },
    async getDueTasksForToday(apiKey: string) {
        return this.getApi(apiKey)
            .getTasks({ filter: "overdue | today" })
            .then((tasks) => console.log(tasks))
            .catch((err) => console.log(err));
    },
    async getDueTasksForThisWeek(apiKey: string) {
        return this.getApi(apiKey)
            .getTasks({ filter: "overdue | today | this week" })
            .then((tasks) => console.log(tasks))
            .catch((err) => console.log(err));
    },
};

export default todoModel;
