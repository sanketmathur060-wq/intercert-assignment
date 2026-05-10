import 'dotenv/config';

import {
  DataSource,
} from 'typeorm';

import {
  Profile,
} from './user/entities/profile.entity';

const dbHost =
  process.env
    .DB_HOST;

const isCloudDb =
  dbHost?.includes(
    'neon.tech'
  ) ||
  dbHost?.includes(
    'amazonaws.com'
  ) ||
  dbHost?.includes(
    'supabase.co'
  ) ||
  dbHost?.includes(
    'railway.app'
  );

console.log(
  'DATA SOURCE DB:',
  process.env
    .DB_NAME
);

console.log(
  'DATA SOURCE HOST:',
  dbHost
);

console.log(
  'IS CLOUD DB:',
  isCloudDb
);

export default
new DataSource({

  type:
    'postgres',

  host:
    dbHost,

  port:
    Number(
      process.env
        .DB_PORT,
    ),

  username:
    process.env
      .DB_USERNAME,

  password:
    process.env
      .DB_PASSWORD,

  database:
    process.env
      .DB_NAME,

  // SSL for Neon / Cloud DB
  ssl:
    isCloudDb
      ? {
          rejectUnauthorized:
            false,
        }
      : false,

  // Required for TypeORM CLI + Neon
  extra:
    isCloudDb
      ? {
          ssl: {
            rejectUnauthorized:
              false,
          },
        }
      : {},

  entities: [
    Profile,
  ],

  migrations: [
    process.env
      .TS_NODE
      ? 'src/migrations/*.ts'
      : 'dist/migrations/*.js',
  ],

  synchronize:
    false,

  logging:
    false,
});