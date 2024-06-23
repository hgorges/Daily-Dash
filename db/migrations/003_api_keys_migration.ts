import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('api_keys', (table) => {
        table.string('api_name', 30).primary().notNullable();
        table.string('api_key', 255).notNullable();
        table
            .uuid('fk_user_id')
            .references('user_id')
            .inTable('users')
            .nullable();
    });
    await knex.raw(/* sql */ `ALTER TABLE "api_keys" OWNER TO postgres;`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('api_keys');
}
