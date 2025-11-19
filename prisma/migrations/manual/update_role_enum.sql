-- Update all existing users' roles from PARENT to USER
UPDATE "User" SET role = 'USER' WHERE role = 'PARENT';
UPDATE "User" SET role = 'USER' WHERE role = 'CHILD';
UPDATE "User" SET role = 'USER' WHERE role = 'ADMIN';

-- Alter the Role enum type to only have USER
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('USER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";
DROP TYPE "Role_old"; 