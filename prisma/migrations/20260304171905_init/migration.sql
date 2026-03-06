-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "businessJustification" TEXT NOT NULL,
    "estimatedCost" REAL,
    "targetStartDate" DATETIME,
    "targetEndDate" DATETIME,
    "priority" TEXT,
    "impact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "requesterUserId" INTEGER NOT NULL,
    "assignedReviewerUserId" INTEGER,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_request_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_request_assignedReviewerUserId_fkey" FOREIGN KEY ("assignedReviewerUserId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectRequestId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "project_request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "decision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectRequestId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "decidedByUserId" INTEGER NOT NULL,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextReviewDate" DATETIME,
    CONSTRAINT "decision_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "project_request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "decision_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectRequestId" INTEGER NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_event_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "project_request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_event_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_request_requestNumber_key" ON "project_request"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "decision_projectRequestId_key" ON "decision"("projectRequestId");
