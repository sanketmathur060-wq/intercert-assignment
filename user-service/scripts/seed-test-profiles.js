const { Client } =
require('pg');

require('dotenv')
.config({
 path:
 '.env.test',
});

async function
seedProfiles() {

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

 const profiles = [
 {
   userId: 1,
   name:
   'Test User 1',

   email:
   'test1@test.com',

   phone:
   '9999999991',
 },

 {
   userId: 2,
   name:
   'Test User 2',

   email:
   'test2@test.com',

   phone:
   '9999999992',
 },

 {
   userId: 3,
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
 WHERE email=$1
 `,
 [profile.email],
 );

 if (
 exists.rows.length
 === 0
 ) {

   await client.query(
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
   inserted`
   );

 } else {

   console.log(
   `${profile.email}
   already exists`
   );
 }
 }

 await client.end();
}

seedProfiles();