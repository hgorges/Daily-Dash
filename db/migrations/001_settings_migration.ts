import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    const dbResult = await knex.raw(/* sql */ `SELECT current_database()`);
    const dbName = dbResult.rows[0].current_database;
    await knex.raw(
        /* sql */ `ALTER DATABASE "${dbName}" SET timezone TO 'UTC'`
    );

    await knex.raw(/* sql */ `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
}

export async function down(knex: Knex): Promise<void> {
    const dbResult = await knex.raw(/* sql */ `SELECT current_database()`);
    const dbName = dbResult.rows[0].current_database;
    await knex.raw(/* sql */ `
        ALTER DATABASE "${dbName}" SET timezone TO 'local'
    `);
    await knex.raw(/* sql */ `DROP EXTENSION IF EXISTS "uuid-ossp"`);
}
