/*
  Warnings:

  - Added the required column `actualBalance` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Wallet" ADD COLUMN     "actualBalance" TEXT NOT NULL;
