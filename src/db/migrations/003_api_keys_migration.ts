import { Knex } from 'knex';

/*
    Migrations are modified for testing purposes.
    In a production environment, migrations should not be altered.
 */

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('api_keys', (table) => {
        table
            .uuid('api_id')
            .defaultTo(knex.raw(/* sql */ `uuid_generate_v4()`))
            .primary()
            .notNullable();
        table.string('api_name', 30).notNullable();
        table.string('api_key', 255).notNullable();
        table
            .uuid('fk_user_id')
            .references('user_id')
            .inTable('users')
            .nullable();
        table.unique(['api_name', 'fk_user_id']);
    });
    await knex.raw(/* sql */ `ALTER TABLE "api_keys" OWNER TO postgres;`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('api_keys');
}
