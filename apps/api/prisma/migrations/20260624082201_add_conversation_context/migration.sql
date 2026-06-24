-- CreateTable
CREATE TABLE "ConversationContext" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "extractedData" JSONB NOT NULL,
    "pendingQuestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationContext_userId_key" ON "ConversationContext"("userId");

-- AddForeignKey
ALTER TABLE "ConversationContext" ADD CONSTRAINT "ConversationContext_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
