import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create devices table
  await knex.schema.createTable("devices", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.jsonb("device_info").notNullable();
    table.jsonb("location_info").notNullable();
    table.boolean("is_primary").defaultTo(false);
    table.timestamp("last_active_at").defaultTo(knex.fn.now());
    table.timestamps(true, true);

    // Add index on user_id
    table.index("user_id", "devices_user_id_idx");
  });

  // Create device_auth table
  await knex.schema.createTable("device_auth", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("device_id")
      .references("id")
      .inTable("devices")
      .onDelete("CASCADE");
    table.string("refresh_token").notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);

    // Add index on device_id
    table.index("device_id", "device_auth_device_id_idx");
  });

  // Create qr_code_auth table
  await knex.schema.createTable("qr_code_auth", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table
      .uuid("device_id")
      .references("id")
      .inTable("devices")
      .onDelete("CASCADE");
    table.string("code").notNullable();
    table.timestamp("expires_at").notNullable();
    table.boolean("is_used").defaultTo(false);
    table.timestamps(true, true);

    // Add index on code
    table.index("code", "qr_code_auth_code_idx");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("qr_code_auth");
  await knex.schema.dropTableIfExists("device_auth");
  await knex.schema.dropTableIfExists("devices");
}
