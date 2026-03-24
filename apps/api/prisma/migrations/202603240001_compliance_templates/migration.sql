CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'COMPLIANCE_REVIEW', 'APPROVED', 'INACTIVE');

ALTER TABLE "Product"
ADD COLUMN     "arabicName" TEXT,
ADD COLUMN     "batchNumberRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "expiryDateRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "importerResponsible" TEXT,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "productStatus" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "sfdaReference" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "usageInstructions" TEXT,
ADD COLUMN     "warnings" TEXT;

ALTER TABLE "Order"
ADD COLUMN     "deliveryEstimate" TEXT,
ADD COLUMN     "paymentMethodLabel" TEXT,
ADD COLUMN     "shippingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vatAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE INDEX "Product_productStatus_idx" ON "Product"("productStatus");
