/*
  Warnings:

  - You are about to drop the column `name` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `name` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "name" TEXT NOT NULL;
