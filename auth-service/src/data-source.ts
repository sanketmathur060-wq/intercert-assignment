import 'dotenv/config';

import {
  DataSource,
} from 'typeorm';

import {
  User,
} from './users/entities/user.entity';

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
        .DB_PORT
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

  // SSL for cloud DB
  ssl:
    isCloudDb
      ? {
          rejectUnauthorized:
            false,
        }
      : false,

  entities: [
    User,
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