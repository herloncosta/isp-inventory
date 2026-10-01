-- AlterTable
ALTER TABLE "stock_locations" ADD COLUMN     "vehicle_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "stock_locations_vehicle_id_key" ON "stock_locations"("vehicle_id");

-- CreateIndex
CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements"("created_at");

-- AddForeignKey
ALTER TABLE "stock_locations" ADD CONSTRAINT "stock_locations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

