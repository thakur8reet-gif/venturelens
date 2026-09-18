CREATE TABLE "IngestionJob" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsRead" INTEGER NOT NULL DEFAULT 0,
    "recordsWritten" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    CONSTRAINT "IngestionJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IngestionJob_provider_startedAt_idx" ON "IngestionJob"("provider", "startedAt");
