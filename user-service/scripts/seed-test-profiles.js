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
seedProfiles() {

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

      // Support Docker + Neon
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

    const profiles = [
      {
        userId:
          1,

        name:
          'Test User 1',

        email:
          'test1@test.com',

        phone:
          '9999999991',
      },

      {
        userId:
          2,

        name:
          'Test User 2',

        email:
          'test2@test.com',

        phone:
          '9999999992',
      },

      {
        userId:
          3,

        name:
          'Test User 3',

        email:
          'test3@test.com',

        phone:
          '9999999993',
      },
    ];

    for (
      const profile
      of profiles
    ) {

      const exists =
        await client.query(
          `
          SELECT *
          FROM profile
          WHERE "userId" = $1
          `,
          [
            profile.userId,
          ],
        );

      if (
        exists.rows
          .length === 0
      ) {

        await client
          .query(
            `
            INSERT INTO profile
            (
              "userId",
              name,
              email,
              phone,
              photo
            )

            VALUES
            (
              $1,
              $2,
              $3,
              $4,
              $5
            )
            `,
            [
              profile.userId,
              profile.name,
              profile.email,
              profile.phone,
              null,
            ],
          );

        console.log(
          `${profile.email}
profile inserted`
        );

      } else {

        console.log(
          `${profile.email}
profile already exists`
        );
      }
    }

    console.log(
      'Profile seeding completed'
    );

  } catch (
    error
  ) {

    console.error(
      'Profile seed failed:',
      error.message
    );

    process.exit(1);

  } finally {

    await client
      .end();
  }
}

seedProfiles();