import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('username').unique().notNullable();
    table.string('avatar_url');
    table.string('role').defaultTo('user');
    table.integer('time_score').defaultTo(0);
    table.jsonb('settings').defaultTo('{}');
    table.timestamps(true, true);
  });

  // Create habits table
  await knex.schema.createTable('habits', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.string('frequency').notNullable(); // daily, weekly, monthly
    table.jsonb('schedule').notNullable(); // specific times/days
    table.integer('streak').defaultTo(0);
    table.integer('level').defaultTo(1);
    table.integer('experience_points').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create time_paradoxes table
  await knex.schema.createTable('time_paradoxes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('habit_id').references('id').inTable('habits').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('severity').notNullable();
    table.string('status').defaultTo('active'); // active, resolved, expired
    table.timestamp('expires_at').notNullable();
    table.timestamp('resolved_at');
    table.jsonb('resolution_data');
    table.timestamps(true, true);
  });

  // Create habit_logs table
  await knex.schema.createTable('habit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('habit_id').references('id').inTable('habits').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('completed_at').notNullable();
    table.jsonb('metadata');
    table.timestamps(true, true);
  });

  // Create user_achievements table
  await knex.schema.createTable('user_achievements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('achievement_type').notNullable();
    table.integer('level').defaultTo(1);
    table.timestamp('unlocked_at').notNullable();
    table.jsonb('metadata');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_achievements');
  await knex.schema.dropTableIfExists('habit_logs');
  await knex.schema.dropTableIfExists('time_paradoxes');
  await knex.schema.dropTableIfExists('habits');
  await knex.schema.dropTableIfExists('users');
} 