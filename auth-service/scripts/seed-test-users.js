const bcrypt =
require('bcrypt');

const { Client } =
require('pg');

require('dotenv')
.config({
 path:
 '.env.test',
});

async function
seedUsers() {

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
   process.env
   .DB_NAME,
 });

 await client.connect();

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
 WHERE email=$1
 `,
 [user.email],
 );

 if (
 exists.rows.length
 === 0
 ) {

   await client.query(
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
   inserted`
   );

 } else {

   console.log(
   `${user.email}
   already exists`
   );
 }
 }

 await client.end();
}

seedUsers();