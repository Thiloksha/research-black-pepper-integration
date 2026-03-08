-- CreateEnum
CREATE TYPE "DetectionStatus" AS ENUM ('SUCCESS', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "disease_detections" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageName" TEXT,
    "imageMimeType" TEXT,
    "imageSizeBytes" INTEGER,
    "predictedDisease" TEXT,
    "confidence" DECIMAL(5,2),
    "description" TEXT,
    "treatment" TEXT,
    "lowConfidence" BOOLEAN NOT NULL DEFAULT false,
    "pepperScore" DECIMAL(5,2),
    "rejectReason" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disease_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detection_probabilities" (
    "id" TEXT NOT NULL,
    "detectionId" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "probability" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "detection_probabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disease_detections_predictedDisease_idx" ON "disease_detections"("predictedDisease");

-- CreateIndex
CREATE INDEX "disease_detections_createdAt_idx" ON "disease_detections"("createdAt");

-- CreateIndex
CREATE INDEX "detection_probabilities_detectionId_idx" ON "detection_probabilities"("detectionId");

-- AddForeignKey
ALTER TABLE "detection_probabilities" ADD CONSTRAINT "detection_probabilities_detectionId_fkey" FOREIGN KEY ("detectionId") REFERENCES "disease_detections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
