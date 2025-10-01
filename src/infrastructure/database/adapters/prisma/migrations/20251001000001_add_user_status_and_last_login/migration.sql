-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('active', 'confirmation_pending', 'suspended', 'banned');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "user_status" "public"."UserStatus" NOT NULL DEFAULT 'confirmation_pending',
ADD COLUMN     "last_login" TIMESTAMP(3);

-- Update existing users to have active status (assuming they were active before)
UPDATE "public"."users" SET "user_status" = 'active' WHERE "user_status" = 'confirmation_pending';