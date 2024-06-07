import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table) => {
        table
            .uuid("user_id")
            .defaultTo(knex.raw("uuid_generate_v4()"))
            .primary()
            .notNullable();
        table.string("username", 30).unique().notNullable();
        table.string("first_name", 50).notNullable();
        table.string("last_name", 50).notNullable();
        table.string("email", 254).notNullable();
        table.string("password", 256).notNullable();
        table.dateTime("created_at").defaultTo(knex.raw("now()")).notNullable();
        table.string("created_by", 30).defaultTo("system").notNullable();
        table.dateTime("updated_at").defaultTo(knex.raw("now()")).notNullable();
        table.string("updated_by", 30).defaultTo("system").notNullable();
    });
    await knex.raw(/* sql */ `ALTER TABLE "users" OWNER TO postgres;`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("users");
}
