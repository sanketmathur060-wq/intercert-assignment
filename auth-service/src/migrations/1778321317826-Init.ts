import {
 MigrationInterface,
 QueryRunner,
 Table,
} from 'typeorm';

export class Init1778321317826
implements
MigrationInterface {

 public async up(
 queryRunner:
 QueryRunner,
 ): Promise<void> {

   await queryRunner
   .createTable(

   new Table({
     name: 'user',

     columns: [
       {
         name: 'id',

         type: 'int',

         isPrimary:
         true,

         isGenerated:
         true,

         generationStrategy:
         'increment',
       },

       {
         name: 'name',

         type:
         'varchar',
       },

       {
         name: 'email',

         type:
         'varchar',

         isUnique:
         true,
       },

       {
         name:
         'password',

         type:
         'varchar',
       },

       {
         name:
         'phone',

         type:
         'varchar',
       },
     ],
   }),
 );
}

 public async down(
 queryRunner:
 QueryRunner,
 ): Promise<void> {

   await queryRunner
   .dropTable(
   'user'
   );
 }
}