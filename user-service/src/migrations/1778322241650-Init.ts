import {
 MigrationInterface,
 QueryRunner,
 Table,
} from 'typeorm';

export class Init1778322241650
implements MigrationInterface {

 public async up(
 queryRunner:
 QueryRunner,
 ): Promise<void> {

   await queryRunner
   .createTable(

   new Table({
     name: 'profile',

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
         name:
         'userId',

         type:
         'int',
       },

       {
         name:
         'name',

         type:
         'varchar',
       },

       {
         name:
         'email',

         type:
         'varchar',

         isUnique:
         true,
       },

       {
         name:
         'phone',

         type:
         'varchar',
       },

       {
         name:
         'photo',

         type:
         'varchar',

         isNullable:
         true,
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
   'profile'
   );
 }
}