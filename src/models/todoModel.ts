import { Task, TodoistApi } from '@doist/todoist-api-typescript';
import assert from 'node:assert';
import { db } from '../server';
import userModel from './userModel';
import { formatInTimeZone } from 'date-fns-tz';
import { add } from 'date-fns';

const todoModel = {
    getTodoistApi(apiKey: string) {
        return new TodoistApi(apiKey);
    },

    async getApiKey(username: string): Promise<string | undefined> {
        const result = await db('api_keys')
            .join('users', 'api_keys.fk_user_id', '=', 'users.user_id')
            .where({ username })
            .first();

        if (result != null) {
            const { api_key } = result;
            return api_key;
        } else {
            return undefined;
        }
    },

    async getDueTodosForToday(username: string): Promise<Task[] | null> {
        const api_key = await this.getApiKey(username);
        if (api_key === undefined) {
            return null;
        }

        return this.getTodoistApi(api_key).getTasks({
            filter: 'due before: today | overdue | today',
        });
    },

    async completeTodo(username: string, id: string): Promise<void> {
        const api_key = await this.getApiKey(username);
        assert(api_key != null, 'Todoist api_key not found');

        await this.getTodoistApi(api_key).closeTask(id);
    },

    async postponeTodo(username: string, id: string): Promise<void> {
        const api_key = await this.getApiKey(username);
        assert(api_key != null, 'Todoist api_key not found');

        const user = await userModel.getUserByUsername(username);
        assert(user != null, 'User not found');

        const { time_zone } = user;

        const tomorrow = add(new Date(), { days: 1 });
        await this.getTodoistApi(api_key).updateTask(id, {
            dueDate: formatInTimeZone(tomorrow, time_zone, 'yyyy-MM-dd'),
        });
    },
};

export default todoModel;
