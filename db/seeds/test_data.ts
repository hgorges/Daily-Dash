import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("user_maps").del();
    await knex("users").del();

    await knex("users").insert([
        {
            username: "test",
            first_name: "Test",
            last_name: "User",
            email: "test@cryptospace.dev",
            password:
                "$2a$12$qZHHSEqWXo7EUac5NtwSCeOU/wNDWtrvSrVXaZsjKNpTdE0kuCtVu",
            todoist_api_key: null,
            created_at: knex.raw("now()"),
            created_by: "system",
            updated_at: knex.raw("now()"),
            updated_by: "system",
        },
    ]);
}
