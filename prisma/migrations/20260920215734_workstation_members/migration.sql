-- CreateTable
CREATE TABLE "_WorkstationMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkstationMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkstationMembers_B_index" ON "_WorkstationMembers"("B");

-- AddForeignKey
ALTER TABLE "_WorkstationMembers" ADD CONSTRAINT "_WorkstationMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Staff"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkstationMembers" ADD CONSTRAINT "_WorkstationMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Workstation"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
