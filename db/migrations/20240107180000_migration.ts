import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function up(knex: Knex): Promise<void> {
    await databaseSettings(knex);

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
        table.string("todoist_api_key").nullable();
        table.dateTime("created_at").defaultTo(knex.raw("now()")).notNullable();
        table.string("created_by", 30).defaultTo("system").notNullable();
        table.dateTime("updated_at").defaultTo(knex.raw("now()")).notNullable();
        table.string("updated_by", 30).defaultTo("system").notNullable();
    });
    await knex.raw(/* sql */ `ALTER TABLE "users" OWNER TO postgres;`);
    const randomPassword = Math.random().toString(36).slice(-8);
    await knex("users").insert({
        username: "system",
        first_name: "System",
        last_name: "User",
        email: "system@cryptospace.dev",
        password: bcrypt.hash(randomPassword, 10),
        todoist_api_key: null,
        created_at: knex.raw("now()"),
        created_by: "system",
        updated_at: knex.raw("now()"),
        updated_by: "system",
    });

    await knex.schema.createTable("user_maps", (table) => {
        table
            .uuid("user_map_id")
            .defaultTo(knex.raw("uuid_generate_v4()"))
            .primary()
            .notNullable();
        table.string("header", 30).nullable();
        table.text("iframe_data").notNullable();
        table
            .uuid("user_id")
            .references("user_id")
            .inTable("users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE")
            .notNullable();
        table.dateTime("created_at").defaultTo(knex.raw("now()")).notNullable();
        table.string("created_by", 30).defaultTo("system").notNullable();
        table.dateTime("updated_at").defaultTo(knex.raw("now()")).notNullable();
        table.string("updated_by", 30).defaultTo("system").notNullable();
    });
    await knex.raw(/* sql */ `ALTER TABLE "user_maps" OWNER TO postgres;`);
}

export async function down(knex: Knex): Promise<void> {
    await revertDatabaseSettings(knex);

    await knex.schema.dropTable("user_maps");
    await knex.schema.dropTable("users");
}

async function databaseSettings(knex: Knex) {
    const dbResult = await knex.raw(/* sql */ `SELECT current_database()`);
    const dbName = dbResult.rows[0].current_database;
    await knex.raw(
        /* sql */ `ALTER DATABASE "${dbName}" SET timezone TO 'UTC'`
    );

    await knex.raw(/* sql */ `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
}

async function revertDatabaseSettings(knex: Knex): Promise<void> {
    const dbResult = await knex.raw("SELECT current_database()");
    const dbName = dbResult.rows[0].current_database;
    await knex.raw(/* sql */ `
        ALTER DATABASE "${dbName}" SET timezone TO 'local'
    `);
    await knex.raw(/* sql */ `DROP EXTENSION IF EXISTS "uuid-ossp"`);
}
