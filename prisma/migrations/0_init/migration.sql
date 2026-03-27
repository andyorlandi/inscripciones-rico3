-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "gender_other" TEXT,
    "personal_code" TEXT NOT NULL,
    "dg1_catedra" TEXT NOT NULL,
    "dg1_otra" TEXT,
    "dg2_catedra" TEXT NOT NULL,
    "dg2_otra" TEXT,
    "morfo1_catedra" TEXT NOT NULL,
    "morfo1_otra" TEXT,
    "morfo2_catedra" TEXT NOT NULL,
    "morfo2_otra" TEXT,
    "tipo1_catedra" TEXT NOT NULL,
    "tipo1_otra" TEXT,
    "tipo2_catedra" TEXT NOT NULL,
    "tipo2_otra" TEXT,
    "is_recursante" BOOLEAN NOT NULL DEFAULT false,
    "recursante_catedra" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" TEXT,
    "affinity_group_id" INTEGER,
    "subgroup_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_state" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "registration_open" BOOLEAN NOT NULL DEFAULT true,
    "linking_enabled" BOOLEAN NOT NULL DEFAULT false,
    "commissions_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "app_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affinity_groups" (
    "id" SERIAL NOT NULL,
    "creator_student_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affinity_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subgroups" (
    "id" SERIAL NOT NULL,
    "affinity_group_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subgroups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_dni_key" ON "students"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "students_personal_code_key" ON "students"("personal_code");

