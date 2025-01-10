-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrls" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "emailAddresses" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 200,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailAddresses_key" ON "User"("emailAddresses");
