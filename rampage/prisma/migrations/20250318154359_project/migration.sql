-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserToProject" DROP CONSTRAINT "UserToProject_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UserToProject" DROP CONSTRAINT "UserToProject_userId_fkey";

-- AlterTable
ALTER TABLE "Commit" ALTER COLUMN "commitAuthorAvatar" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Commit_projectId_idx" ON "Commit"("projectId");

-- CreateIndex
CREATE INDEX "Commit_commitHash_idx" ON "Commit"("commitHash");

-- CreateIndex
CREATE INDEX "Issue_meetingId_idx" ON "Issue"("meetingId");

-- CreateIndex
CREATE INDEX "Meeting_projectId_idx" ON "Meeting"("projectId");

-- CreateIndex
CREATE INDEX "Question_projectId_idx" ON "Question"("projectId");

-- CreateIndex
CREATE INDEX "Question_userId_idx" ON "Question"("userId");

-- CreateIndex
CREATE INDEX "UserToProject_userId_idx" ON "UserToProject"("userId");

-- CreateIndex
CREATE INDEX "UserToProject_projectId_idx" ON "UserToProject"("projectId");

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "account_userId_index" RENAME TO "Account_userId_idx";

-- RenameIndex
ALTER INDEX "session_userId_index" RENAME TO "Session_userId_idx";
