-- AlterTable
ALTER TABLE "public"."chat" ADD COLUMN     "adminId" TEXT;

-- CreateTable
CREATE TABLE "public"."AdminUserAssignment" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdminUserAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminUserAssignment_adminId_idx" ON "public"."AdminUserAssignment"("adminId");

-- CreateIndex
CREATE INDEX "AdminUserAssignment_userId_idx" ON "public"."AdminUserAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUserAssignment_userId_active_key" ON "public"."AdminUserAssignment"("userId", "active");

-- AddForeignKey
ALTER TABLE "public"."chat" ADD CONSTRAINT "chat_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminUserAssignment" ADD CONSTRAINT "AdminUserAssignment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminUserAssignment" ADD CONSTRAINT "AdminUserAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
