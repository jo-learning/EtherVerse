/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `userWallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `userWallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."userWallet" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "userWallet_userId_key" ON "public"."userWallet"("userId");

-- AddForeignKey
ALTER TABLE "public"."userWallet" ADD CONSTRAINT "userWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
