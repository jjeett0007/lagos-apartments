-- AlterTable
ALTER TABLE "RoomMeasurement" ADD COLUMN     "photoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RoomMeasurement" ADD CONSTRAINT "RoomMeasurement_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
