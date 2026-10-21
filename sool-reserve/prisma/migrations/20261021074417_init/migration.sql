-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('APPLIED', 'DOCS_REVIEW', 'PRODUCT_REVIEW', 'PROFIT_REVIEW', 'CONTRACT', 'APPROVED', 'LISTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LiquorType" AS ENUM ('DISTILLED_SOJU', 'YAKJU', 'CHEONGJU', 'TAKJU', 'FRUIT_WINE', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalClass" AS ENUM ('FOLK', 'REGIONAL', 'NONE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('UNCHECKED', 'IN_REVIEW', 'VERIFIED', 'INELIGIBLE');

-- CreateEnum
CREATE TYPE "TradeModel" AS ENUM ('COMMISSION', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "TasteSource" AS ENUM ('MANUFACTURER', 'IN_HOUSE', 'NONE');

-- CreateEnum
CREATE TYPE "VatBasis" AS ENUM ('INCLUSIVE', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "CostBearer" AS ENUM ('PLATFORM', 'SELLER');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('AMBIENT', 'REFRIGERATED');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('MAIN', 'GIFT', 'PROFIT', 'LIMITED', 'SEASONAL');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('HEALTH_WARNING', 'YOUTH_NOTICE', 'INTERMEDIARY', 'TERMS', 'PRIVACY', 'SHIPPING_POLICY', 'RETURN_POLICY');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('PARTNERSHIP', 'CORPORATE', 'CUSTOMER', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'CURATOR', 'FINANCE', 'BREWERY_ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Brewery" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "region" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "tagline" TEXT,
    "history" TEXT,
    "artisan" TEXT,
    "artisanTitle" TEXT,
    "ingredientOrigin" TEXT,
    "waterAndNuruk" TEXT,
    "method" TEXT,
    "aging" TEXT,
    "philosophy" TEXT,
    "awards" TEXT,
    "awardsVerified" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "website" TEXT,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'APPLIED',
    "salesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultCommissionRate" DOUBLE PRECISION,
    "supplyTerms" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brewery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerCompliance" (
    "id" TEXT NOT NULL,
    "breweryId" TEXT NOT NULL,
    "businessName" TEXT,
    "representative" TEXT,
    "businessNumber" TEXT,
    "address" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "mailOrderNumber" TEXT,
    "liquorLicenseNote" TEXT,
    "traditionalBasisNote" TEXT,
    "documentUrls" TEXT[],
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "breweryId" TEXT NOT NULL,
    "region" TEXT,
    "liquorType" "LiquorType" NOT NULL,
    "legalClass" "LegalClass" NOT NULL DEFAULT 'UNKNOWN',
    "eligibility" "EligibilityStatus" NOT NULL DEFAULT 'UNCHECKED',
    "eligibilityNote" TEXT,
    "tradeModel" "TradeModel" NOT NULL DEFAULT 'COMMISSION',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "description" TEXT,
    "abv" DOUBLE PRECISION NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "ingredients" TEXT NOT NULL,
    "origin" TEXT,
    "productionMethod" TEXT,
    "agingMethod" TEXT,
    "agingPeriod" TEXT,
    "shelfLife" TEXT,
    "storageGuide" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "imageCredit" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isMaster" BOOLEAN NOT NULL DEFAULT false,
    "masterVerified" BOOLEAN NOT NULL DEFAULT false,
    "isLimited" BOOLEAN NOT NULL DEFAULT false,
    "limitedVerified" BOOLEAN NOT NULL DEFAULT false,
    "productionCount" INTEGER,
    "flavorTags" TEXT[],
    "occasions" TEXT[],
    "giftPurposes" TEXT[],
    "pairingCategories" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tasteSweetness" INTEGER,
    "tasteAcidity" INTEGER,
    "tasteBody" INTEGER,
    "tasteCarbonation" INTEGER,
    "tasteAroma" INTEGER,
    "tasteSource" "TasteSource" NOT NULL DEFAULT 'NONE',
    "tasteEvaluator" TEXT,
    "tasteEvaluatedAt" TIMESTAMP(3),
    "tasteNotes" TEXT,
    "servingTemp" TEXT,
    "glassware" TEXT,
    "chillBeforeServing" BOOLEAN,
    "afterOpening" TEXT,
    "aromaNotes" TEXT,
    "pairings" JSONB,
    "giftRecommendFor" TEXT,
    "giftBoxContents" TEXT,
    "giftWrapOptions" TEXT,
    "shoppingBag" BOOLEAN NOT NULL DEFAULT false,
    "messageCard" BOOLEAN NOT NULL DEFAULT false,
    "giftDelivery" BOOLEAN NOT NULL DEFAULT false,
    "storageType" "StorageType" NOT NULL DEFAULT 'AMBIENT',
    "storageTemp" TEXT,
    "coldChainRequired" BOOLEAN NOT NULL DEFAULT false,
    "coldPackaging" TEXT,
    "shipDays" TEXT[],
    "noShipBeforeHoliday" BOOLEAN NOT NULL DEFAULT false,
    "shipRegions" TEXT,
    "protectivePackaging" TEXT,
    "carrier" TEXT,
    "shippingFee" INTEGER NOT NULL DEFAULT 0,
    "damagePolicy" TEXT,
    "vatBasis" "VatBasis" NOT NULL DEFAULT 'INCLUSIVE',
    "commissionRate" DOUBLE PRECISION,
    "pgRate" DOUBLE PRECISION NOT NULL DEFAULT 3.3,
    "pgBearer" "CostBearer" NOT NULL DEFAULT 'PLATFORM',
    "platformShippingCost" INTEGER NOT NULL DEFAULT 0,
    "platformPromoCost" INTEGER NOT NULL DEFAULT 0,
    "otherVariableCost" INTEGER NOT NULL DEFAULT 0,
    "wholesaleCost" INTEGER,
    "expectedMonthlyUnits" INTEGER NOT NULL DEFAULT 0,
    "scoreEligibility" INTEGER,
    "scoreReputation" INTEGER,
    "scoreStory" INTEGER,
    "scoreQuality" INTEGER,
    "scoreRarity" INTEGER,
    "scoreDesign" INTEGER,
    "scoreGift" INTEGER,
    "scoreProfit" INTEGER,
    "scoreSupply" INTEGER,
    "scoreLogistics" INTEGER,
    "scoreNote" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedSlot" (
    "id" TEXT NOT NULL,
    "slot" "SlotType" NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "FeaturedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "LegalNotice" (
    "id" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "sourceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "type" "InquiryType" NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "payload" JSONB,
    "consentPrivacy" BOOLEAN NOT NULL DEFAULT false,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "breweryId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerRef" TEXT NOT NULL,
    "ageVerificationId" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "isTest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "breweryId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,

    CONSTRAINT "SellerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "giftWrap" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "damageReported" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "breweryId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "pgCost" INTEGER NOT NULL,
    "payout" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgeVerification" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalTx" TEXT NOT NULL,
    "isAdult" BOOLEAN NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgeVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brewery_slug_key" ON "Brewery"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SellerCompliance_breweryId_key" ON "SellerCompliance"("breweryId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_breweryId_idx" ON "Product"("breweryId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedSlot_slot_productId_key" ON "FeaturedSlot"("slot", "productId");

-- CreateIndex
CREATE INDEX "LegalNotice_type_effectiveFrom_idx" ON "LegalNotice"("type", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- AddForeignKey
ALTER TABLE "SellerCompliance" ADD CONSTRAINT "SellerCompliance_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "Brewery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "Brewery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedSlot" ADD CONSTRAINT "FeaturedSlot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "Brewery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "Brewery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "Brewery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
