/*
  Warnings:

  - You are about to drop the column `joinCode` on the `List` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[joinCodeHash]` on the table `List` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "List_joinCode_key";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "joinCode",
ADD COLUMN     "joinCodeHash" TEXT;

-- AlterTable
ALTER TABLE "ListMember" ALTER COLUMN "role" SET DEFAULT 'admin';

-- CreateIndex
CREATE UNIQUE INDEX "List_joinCodeHash_key" ON "List"("joinCodeHash");
