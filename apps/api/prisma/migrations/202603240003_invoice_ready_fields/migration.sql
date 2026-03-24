ALTER TABLE "Order"
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "invoiceIssuedAt" TIMESTAMP(3),
ADD COLUMN     "refundNoteNumber" TEXT,
ADD COLUMN     "refundIssuedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");
CREATE UNIQUE INDEX "Order_refundNoteNumber_key" ON "Order"("refundNoteNumber");
