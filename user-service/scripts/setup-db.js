const { Client } =
require('pg');

require('dotenv')
.config({
 path:
 `.env.${
 process.argv[2]
 || 'dev'
 }`,
});

async function
createDatabase() {

 const client =
 new Client({
   host:
   process.env
   .DB_HOST,

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
   'postgres',
 });

 await client.connect();

 const dbName =
 process.env.DB_NAME;

 const checkDb =
 await client.query(`
 SELECT datname
 FROM pg_database
 WHERE datname =
 '${dbName}'
 `);

 if (
 checkDb.rows.length
 === 0
 ) {

   await client.query(
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

 await client.end();
}

createDatabase();