-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('LABORATORY_REPORT', 'PRESCRIPTION', 'IMAGING_REPORT', 'DISCHARGE_SUMMARY', 'CONSULTATION_NOTE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'ACTIVE', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "DocumentAuditEventType" AS ENUM ('DOCUMENT_UPLOADED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_VIEWED', 'DOCUMENT_METADATA_UPDATED', 'DOCUMENT_SOFT_DELETED', 'DOCUMENT_RESTORED', 'DOCUMENT_PURGED', 'DOCUMENT_ACCESS_DENIED', 'MALWARE_DETECTED');

-- CreateTable
CREATE TABLE "medical_documents" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "fileSize" INTEGER NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "documentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "medical_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_storage_metadata" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageVersion" INTEGER NOT NULL DEFAULT 1,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "encryptedDek" TEXT NOT NULL,
    "dekNonce" TEXT NOT NULL,
    "dekAuthTag" TEXT NOT NULL,
    "fileNonce" TEXT NOT NULL,
    "fileAuthTag" TEXT NOT NULL,
    "sha256Checksum" TEXT NOT NULL,
    "ciphertextBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_storage_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_audit_events" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "userId" TEXT NOT NULL,
    "eventType" "DocumentAuditEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_documents_ownerId_idx" ON "medical_documents"("ownerId");

-- CreateIndex
CREATE INDEX "medical_documents_ownerId_deletedAt_idx" ON "medical_documents"("ownerId", "deletedAt");

-- CreateIndex
CREATE INDEX "medical_documents_ownerId_category_idx" ON "medical_documents"("ownerId", "category");

-- CreateIndex
CREATE INDEX "medical_documents_status_idx" ON "medical_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "document_storage_metadata_documentId_key" ON "document_storage_metadata"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_storage_metadata_storageKey_key" ON "document_storage_metadata"("storageKey");

-- CreateIndex
CREATE INDEX "document_storage_metadata_storageKey_idx" ON "document_storage_metadata"("storageKey");

-- CreateIndex
CREATE INDEX "document_audit_events_userId_idx" ON "document_audit_events"("userId");

-- CreateIndex
CREATE INDEX "document_audit_events_documentId_idx" ON "document_audit_events"("documentId");

-- CreateIndex
CREATE INDEX "document_audit_events_eventType_idx" ON "document_audit_events"("eventType");

-- CreateIndex
CREATE INDEX "document_audit_events_timestamp_idx" ON "document_audit_events"("timestamp");

-- AddForeignKey
ALTER TABLE "medical_documents" ADD CONSTRAINT "medical_documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_storage_metadata" ADD CONSTRAINT "document_storage_metadata_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "medical_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_audit_events" ADD CONSTRAINT "document_audit_events_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "medical_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
