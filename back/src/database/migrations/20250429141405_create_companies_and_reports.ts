import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("companies", (table: Knex.TableBuilder) => {
    table.string("cik", 10).primary().notNullable();

    table.string("name").notNullable();
    table.string("ticker").notNullable();
    table.string("logo").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("reports", (table: Knex.TableBuilder) => {
    table.string("accession_number").primary().notNullable();
    table
      .string("cik", 10)
      .notNullable()
      .references("cik")
      .inTable("companies")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.string("form_type").notNullable();
    table.date("file_date").notNullable();
    table.date("period_ending").nullable();
    table.string("url").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reports");
  await knex.schema.dropTableIfExists("companies");
}
