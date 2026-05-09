import 'dotenv/config';

import {
 DataSource,
} from 'typeorm';

import {
 User,
} from './users/entities/user.entity';

const env =
process.env.NODE_ENV
 || 'dev';

export default
new DataSource({

 type:
 'postgres',

 host:
 process.env
 .DB_HOST,

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

 entities: [
 User,
 ],

 migrations: [
 'src/migrations/*.ts',
 ],

 synchronize:
 false,
});