-- CreateTable
CREATE TABLE "variety_detections" (
    "id" TEXT NOT NULL,
    "imageName" TEXT,
    "imageMimeType" TEXT,
    "imageSizeBytes" INTEGER,
    "stageALabel" TEXT,
    "stageAConfidence" DECIMAL(5,2),
    "predictedVariety" TEXT,
    "confidence" DECIMAL(5,2),
    "message" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT true,
    "lowConfidence" BOOLEAN NOT NULL DEFAULT false,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variety_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variety_probabilities" (
    "id" TEXT NOT NULL,
    "detectionId" TEXT NOT NULL,
    "varietyName" TEXT NOT NULL,
    "probability" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "variety_probabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "variety_detections_predictedVariety_idx" ON "variety_detections"("predictedVariety");

-- CreateIndex
CREATE INDEX "variety_detections_createdAt_idx" ON "variety_detections"("createdAt");

-- CreateIndex
CREATE INDEX "variety_probabilities_detectionId_idx" ON "variety_probabilities"("detectionId");

-- AddForeignKey
ALTER TABLE "variety_probabilities" ADD CONSTRAINT "variety_probabilities_detectionId_fkey" FOREIGN KEY ("detectionId") REFERENCES "variety_detections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
