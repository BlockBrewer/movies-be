import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesTable1700000001000 implements MigrationInterface {
  name = 'CreateMoviesTable1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "movies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "publishing_year" integer NOT NULL,
        "poster_url" character varying(1024) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_movies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_movies_title" UNIQUE ("title")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "movies"');
  }
}
