const bcrypt =
require('bcrypt');

const {
  Client,
} = require('pg');

const env =
  process.argv[2]
  || 'test';

require('dotenv')
.config({
  path:
    `.env.${env}`,
});

async function
seedUsers() {

  const dbHost =
    process.env
      .DB_HOST;

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
        process.env
          .DB_NAME,

      // Works for Neon + Local Docker
      ssl:
        dbHost?.includes(
          'neon.tech'
        )
          ? {
              rejectUnauthorized:
                false,
            }
          : false,
    });

  try {

    await client
      .connect();

    console.log(
      'Connected to DB:',
      process.env
        .DB_NAME
    );

    const password =
      await bcrypt.hash(
        'Password1',
        10,
      );

    const users = [
      {
        name:
          'Test User 1',

        email:
          'test1@test.com',

        phone:
          '9999999991',
      },

      {
        name:
          'Test User 2',

        email:
          'test2@test.com',

        phone:
          '9999999992',
      },

      {
        name:
          'Test User 3',

        email:
          'test3@test.com',

        phone:
          '9999999993',
      },
    ];

    for (
      const user
      of users
    ) {

      const exists =
        await client.query(
          `
          SELECT *
          FROM "user"
          WHERE email = $1
          `,
          [
            user.email,
          ],
        );

      if (
        exists.rows
          .length === 0
      ) {

        await client
          .query(
            `
            INSERT INTO "user"
            (
              name,
              email,
              password,
              phone
            )

            VALUES
            (
              $1,
              $2,
              $3,
              $4
            )
            `,
            [
              user.name,
              user.email,
              password,
              user.phone,
            ],
          );

        console.log(
          `${user.email}
inserted`,
        );

      } else {

        console.log(
          `${user.email}
already exists`,
        );
      }
    }

    console.log(
      'Seeding completed'
    );

  } catch (
    error
  ) {

    console.error(
      'Seeding failed:',
      error.message,
    );

    process.exit(1);

  } finally {

    await client
      .end();
  }
}

seedUsers();