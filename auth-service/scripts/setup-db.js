const {
  Client,
} = require('pg');

require('dotenv')
.config({
  path:
    `.env.${
      process.argv[2]
      || 'dev'
    }`,
});

console.log(
  'DB NAME:',
  process.env
    .DB_NAME
);

async function
createDatabase() {

  const dbHost =
    process.env
      .DB_HOST;

  const isCloudDb =
    dbHost?.includes(
      'neon.tech'
    );

  const client =
    new Client({

      host:
        dbHost,

      port:
        process.env
          .DB_PORT,

      user:
        process.env
          .DB_USERNAME,

      password:
        process.env
          .DB_PASSWORD,

      database:
        isCloudDb
          ? process.env
              .DB_NAME
          : 'postgres',

      // Neon SSL support
      ssl:
        isCloudDb
          ? {
              rejectUnauthorized:
                false,
            }
          : false,
    });

  try {

    await client
      .connect();

    const dbName =
      process.env
        .DB_NAME;

    // Cloud DB
    if (
      isCloudDb
    ) {

      console.log(
        `Cloud DB connected:
${dbName}`
      );

      console.log(
        'Skipping CREATE DATABASE for Neon'
      );

      return;
    }

    // Local Docker DB
    const checkDb =
      await client.query(
        `
        SELECT datname
        FROM pg_database
        WHERE datname = $1
        `,
        [dbName],
      );

    if (
      checkDb.rows
        .length === 0
    ) {

      await client
        .query(
          `CREATE DATABASE ${dbName}`
        );

      console.log(
        `Database ${dbName}
created`
      );

    } else {

      console.log(
        `Database ${dbName}
already exists`
      );
    }

  } catch (
    error
  ) {

    console.error(
      'DB setup failed:',
      error.message
    );

    process.exit(1);

  } finally {

    await client.end();
  }
}

createDatabase();