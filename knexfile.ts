import { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_DATABASE || "chronoflow",
      port: parseInt(process.env.DB_PORT || "5433"),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },

  test: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_DATABASE || "chronoflow_test",
      port: parseInt(process.env.DB_PORT || "5433"),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },

  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT || "5433"),
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: "./dist/database/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./dist/database/seeds",
      extension: "js",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
