-- AlterTable
ALTER TABLE "public"."KYC" ADD COLUMN     "certificateNumber" TEXT,
ADD COLUMN     "certificateType" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "handHeldPath" TEXT,
ADD COLUMN     "idBackPath" TEXT,
ADD COLUMN     "idFrontPath" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "Brithdate" SET DEFAULT '',
ALTER COLUMN "Place" SET DEFAULT '';
