/*
  Warnings:

  - Added the required column `username` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refreshtoken` ADD COLUMN `username` VARCHAR(191) NOT NULL;
