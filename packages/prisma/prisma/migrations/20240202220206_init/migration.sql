-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "aiGeneratedTitle" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "styleId" INTEGER NOT NULL,
    "tokensUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScraperQueue" (
    "id" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "styleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScraperQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStyles" (
    "id" SERIAL NOT NULL,
    "styleName" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiStyles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipts" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "AiStyles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScraperQueue" ADD CONSTRAINT "ScraperQueue_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "AiStyles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipts" ADD CONSTRAINT "Receipts_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
