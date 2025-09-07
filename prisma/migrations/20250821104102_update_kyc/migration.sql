/*
  Warnings:

  - You are about to drop the column `fullName` on the `KYC` table. All the data in the column will be lost.
  - You are about to drop the column `idNumber` on the `KYC` table. All the data in the column will be lost.
  - Added the required column `Brithdate` to the `KYC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `KYC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Place` to the `KYC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `KYC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `KYC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."KYC" DROP COLUMN "fullName",
DROP COLUMN "idNumber",
ADD COLUMN     "Brithdate" TEXT NOT NULL,
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "Place" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
