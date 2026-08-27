-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('postgresql', 'mongodb');

-- AlterTable
ALTER TABLE "DataSource"
ALTER COLUMN "type" TYPE "DataSourceType"
USING "type"::"DataSourceType";