import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000)
}

async function main() {
  // Clear existing data
  await prisma.auditEvent.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.projectRequest.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const [requester, reviewer, approver, admin] = await Promise.all([
    prisma.user.create({ data: { id: 1, name: 'Requester1', role: 'REQUESTER' } }),
    prisma.user.create({ data: { id: 2, name: 'Reviewer1', role: 'REVIEWER' } }),
    prisma.user.create({ data: { id: 3, name: 'Approver1', role: 'DECISION_MAKER' } }),
    prisma.user.create({ data: { id: 4, name: 'Admin1', role: 'ADMIN' } }),
  ])
  console.log('Created users:', requester.name, reviewer.name, approver.name, admin.name)

  // Helper to create a request and set requestNumber = PRJ-{id}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function createRequest(data: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await prisma.projectRequest.create({ data: { ...data, requestNumber: 'TEMP' } as any })
    await prisma.projectRequest.update({
      where: { id: r.id },
      data: { requestNumber: `PRJ-${String(r.id).padStart(6, '0')}` },
    })
    return prisma.projectRequest.findUniqueOrThrow({ where: { id: r.id } })
  }

  // 1. DRAFT — Marketing Automation Platform
  const r1 = await createRequest({
    title: 'Marketing Automation Platform',
    description: 'Evaluating tools to automate email campaigns and lead scoring.',
    department: 'Marketing',
    category: 'Tool/Software',
    businessJustification: 'Manual campaign management is costing 20+ hours/week.',
    status: 'DRAFT',
    requesterUserId: requester.id,
    createdAt: daysAgo(10),
  })
  await prisma.auditEvent.create({
    data: {
      projectRequestId: r1.id,
      actorUserId: requester.id,
      eventType: 'CREATED',
      createdAt: daysAgo(10),
    },
  })

  // 2. DRAFT — Office Expansion
  const r2 = await createRequest({
    title: 'Office Space Expansion Phase 2',
    description: 'Additional 2,000 sq ft needed for new hires.',
    department: 'Operations',
    category: 'Infrastructure',
    businessJustification: 'Current space at 95% capacity, impacting collaboration.',
    status: 'DRAFT',
    requesterUserId: requester.id,
    createdAt: daysAgo(5),
  })
  await prisma.auditEvent.create({
    data: {
      projectRequestId: r2.id,
      actorUserId: requester.id,
      eventType: 'CREATED',
      createdAt: daysAgo(5),
    },
  })

  // 3. SUBMITTED — Q2 Budget Increase
  const r3 = await createRequest({
    title: 'Q2 Marketing Budget Increase',
    description: 'Request to increase the Q2 marketing budget for paid campaigns.',
    department: 'Marketing',
    category: 'Budget Approval',
    businessJustification: 'Pipeline generation is below target. Increased spend will fund digital ads.',
    estimatedCost: 25000,
    status: 'SUBMITTED',
    requesterUserId: requester.id,
    submittedAt: daysAgo(8),
    createdAt: daysAgo(12),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r3.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(12) },
      { projectRequestId: r3.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(8) },
    ],
  })

  // 4. SUBMITTED — Developer Laptop Refresh
  const r4 = await createRequest({
    title: 'Developer Laptop Refresh',
    description: 'Replace 12 aging developer laptops that are 4+ years old.',
    department: 'Engineering',
    category: 'Tool/Software',
    businessJustification: 'Aging hardware is causing productivity loss. Estimated 30 min/day lost per dev.',
    estimatedCost: 15000,
    priority: 'High',
    status: 'SUBMITTED',
    requesterUserId: requester.id,
    submittedAt: daysAgo(6),
    createdAt: daysAgo(9),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r4.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(9) },
      { projectRequestId: r4.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(6) },
    ],
  })

  // 5. UNDER_REVIEW — CRM System Upgrade (went through More Info cycle)
  const r5 = await createRequest({
    title: 'CRM System Upgrade',
    description: 'Migrate from current CRM to a modern platform with better analytics.',
    department: 'Marketing',
    category: 'Tool/Software',
    businessJustification: 'Current CRM lacks API integrations and reporting. Upgrade will improve sales cycle visibility.',
    estimatedCost: 45000,
    priority: 'High',
    impact: 'High — affects 15 sales reps and 3 marketing staff.',
    status: 'UNDER_REVIEW',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(20),
    createdAt: daysAgo(25),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r5.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(25) },
      { projectRequestId: r5.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(20) },
      { projectRequestId: r5.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(19) },
      { projectRequestId: r5.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(19) },
      { projectRequestId: r5.id, actorUserId: reviewer.id, eventType: 'COMMENT_ADDED', newValue: 'More Info Request', createdAt: daysAgo(15) },
      { projectRequestId: r5.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'MORE_INFO_REQUESTED', createdAt: daysAgo(15) },
      { projectRequestId: r5.id, actorUserId: requester.id, eventType: 'COMMENT_ADDED', newValue: 'Response', createdAt: daysAgo(12) },
      { projectRequestId: r5.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'MORE_INFO_REQUESTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(12) },
    ],
  })
  await prisma.comment.createMany({
    data: [
      {
        projectRequestId: r5.id,
        authorUserId: reviewer.id,
        body: 'Could you provide more details on the expected ROI and integration requirements with Salesforce?',
        type: 'MORE_INFO_REQUEST',
        createdAt: daysAgo(15),
      },
      {
        projectRequestId: r5.id,
        authorUserId: requester.id,
        body: 'Estimated ROI is 3x within 18 months. Salesforce integration uses a native connector — no custom development required. Happy to provide the vendor comparison doc.',
        type: 'RESPONSE',
        createdAt: daysAgo(12),
      },
    ],
  })

  // 6. UNDER_REVIEW — Security Awareness Training
  const r6 = await createRequest({
    title: 'Security Awareness Training Platform',
    description: 'Annual security training platform subscription for all employees.',
    department: 'Engineering',
    category: 'Tool/Software',
    businessJustification: 'Compliance requirement. Current phishing simulation rates are 18% click-through, above industry average of 8%.',
    estimatedCost: 8000,
    status: 'UNDER_REVIEW',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(14),
    createdAt: daysAgo(18),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r6.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(18) },
      { projectRequestId: r6.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(14) },
      { projectRequestId: r6.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(13) },
      { projectRequestId: r6.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(13) },
      { projectRequestId: r6.id, actorUserId: reviewer.id, eventType: 'COMMENT_ADDED', newValue: 'General', createdAt: daysAgo(10) },
    ],
  })
  await prisma.comment.create({
    data: {
      projectRequestId: r6.id,
      authorUserId: reviewer.id,
      body: 'Reviewed with IT Security team. Vendor has SOC 2 certification. Looks solid — will escalate soon.',
      type: 'GENERAL',
      createdAt: daysAgo(10),
    },
  })

  // 7. MORE_INFO_REQUESTED — Remote Work Policy Update
  const r7 = await createRequest({
    title: 'Remote Work Policy Update',
    description: 'Proposal to revise the remote work policy to allow 3 days/week remote.',
    department: 'HR',
    category: 'Process Change',
    businessJustification: 'Employee survey showed 78% want more flexibility. Current 2-day policy is below market.',
    status: 'MORE_INFO_REQUESTED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(22),
    createdAt: daysAgo(28),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r7.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(28) },
      { projectRequestId: r7.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(22) },
      { projectRequestId: r7.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(20) },
      { projectRequestId: r7.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(20) },
      { projectRequestId: r7.id, actorUserId: reviewer.id, eventType: 'COMMENT_ADDED', newValue: 'More Info Request', createdAt: daysAgo(16) },
      { projectRequestId: r7.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'MORE_INFO_REQUESTED', createdAt: daysAgo(16) },
    ],
  })
  await prisma.comment.create({
    data: {
      projectRequestId: r7.id,
      authorUserId: reviewer.id,
      body: 'Please clarify the compliance implications. Which specific HR regulations does this policy update address? Also, what is the plan for roles that require physical presence?',
      type: 'MORE_INFO_REQUEST',
      createdAt: daysAgo(16),
    },
  })

  // 8. MORE_INFO_REQUESTED — Cloud Storage Expansion
  const r8 = await createRequest({
    title: 'Cloud Storage Expansion',
    description: 'Increase cloud storage allocation from 50TB to 150TB.',
    department: 'Engineering',
    category: 'Infrastructure',
    businessJustification: 'Current storage at 87% capacity. At current growth rate, will hit limit in 45 days.',
    estimatedCost: 12000,
    priority: 'High',
    status: 'MORE_INFO_REQUESTED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(18),
    createdAt: daysAgo(22),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r8.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(22) },
      { projectRequestId: r8.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(18) },
      { projectRequestId: r8.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(17) },
      { projectRequestId: r8.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(17) },
      { projectRequestId: r8.id, actorUserId: reviewer.id, eventType: 'COMMENT_ADDED', newValue: 'More Info Request', createdAt: daysAgo(14) },
      { projectRequestId: r8.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'MORE_INFO_REQUESTED', createdAt: daysAgo(14) },
    ],
  })
  await prisma.comment.create({
    data: {
      projectRequestId: r8.id,
      authorUserId: reviewer.id,
      body: 'What is the breakdown of this cost — is this annual or one-time? Which data sets are driving the storage growth? Have we evaluated archiving older data first?',
      type: 'MORE_INFO_REQUEST',
      createdAt: daysAgo(14),
    },
  })

  // 9. READY_FOR_DECISION — HR Software Renewal
  const r9 = await createRequest({
    title: 'HR Software Annual Renewal',
    description: 'Renewal of Workday subscription for HRIS functionality.',
    department: 'HR',
    category: 'Vendor Contract',
    businessJustification: 'Core system for payroll, benefits, and performance management. Non-negotiable renewal.',
    estimatedCost: 18000,
    status: 'READY_FOR_DECISION',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(30),
    createdAt: daysAgo(35),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r9.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(35) },
      { projectRequestId: r9.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(30) },
      { projectRequestId: r9.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(28) },
      { projectRequestId: r9.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(28) },
      { projectRequestId: r9.id, actorUserId: reviewer.id, eventType: 'COMMENT_ADDED', newValue: 'General', createdAt: daysAgo(20) },
      { projectRequestId: r9.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(5) },
    ],
  })
  await prisma.comment.create({
    data: {
      projectRequestId: r9.id,
      authorUserId: reviewer.id,
      body: 'Vendor pricing confirmed and in line with last year. Contract reviewed by legal. Recommending approval.',
      type: 'GENERAL',
      createdAt: daysAgo(20),
    },
  })

  // 10. READY_FOR_DECISION — Data Analytics Platform
  const r10 = await createRequest({
    title: 'Data Analytics Platform',
    description: 'Enterprise BI tool to replace spreadsheet-based reporting.',
    department: 'Finance',
    category: 'Tool/Software',
    businessJustification: 'Finance team spends 15 hours/week on manual reports. BI tool will reduce this to 2 hours.',
    estimatedCost: 75000,
    priority: 'High',
    impact: 'High — enables real-time financial dashboards across all departments.',
    status: 'READY_FOR_DECISION',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(40),
    createdAt: daysAgo(45),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r10.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(45) },
      { projectRequestId: r10.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(40) },
      { projectRequestId: r10.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(38) },
      { projectRequestId: r10.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(38) },
      { projectRequestId: r10.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(7) },
    ],
  })

  // 11. READY_FOR_DECISION — Legal Document Management
  const r11 = await createRequest({
    title: 'Legal Document Management System',
    description: 'Centralized contract repository with e-signature integration.',
    department: 'Legal',
    category: 'Tool/Software',
    businessJustification: 'Contracts currently stored across email, shared drives, and paper. Compliance risk.',
    estimatedCost: 22000,
    status: 'READY_FOR_DECISION',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(28),
    createdAt: daysAgo(32),
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r11.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(32) },
      { projectRequestId: r11.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(28) },
      { projectRequestId: r11.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(26) },
      { projectRequestId: r11.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(26) },
      { projectRequestId: r11.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(4) },
    ],
  })

  // 12. APPROVED — Employee Wellness Program
  const r12 = await createRequest({
    title: 'Employee Wellness Program',
    description: 'Mental health and fitness stipend for all full-time employees.',
    department: 'HR',
    category: 'Budget Approval',
    businessJustification: 'Retention tool. Industry data shows wellness programs reduce turnover by 25%.',
    estimatedCost: 30000,
    status: 'APPROVED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(55),
    createdAt: daysAgo(60),
  })
  await prisma.decision.create({
    data: {
      projectRequestId: r12.id,
      outcome: 'APPROVED',
      rationale: 'Strong alignment with employee retention goals. Budget within acceptable range. Program to launch Q2.',
      decidedByUserId: approver.id,
      decidedAt: daysAgo(30),
    },
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r12.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(60) },
      { projectRequestId: r12.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(55) },
      { projectRequestId: r12.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(53) },
      { projectRequestId: r12.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(53) },
      { projectRequestId: r12.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(35) },
      { projectRequestId: r12.id, actorUserId: approver.id, eventType: 'DECISION_RECORDED', newValue: 'APPROVED', createdAt: daysAgo(30) },
      { projectRequestId: r12.id, actorUserId: approver.id, eventType: 'STATUS_CHANGED', oldValue: 'READY_FOR_DECISION', newValue: 'APPROVED', createdAt: daysAgo(30) },
    ],
  })

  // 13. APPROVED — CI/CD Pipeline Tooling
  const r13 = await createRequest({
    title: 'CI/CD Pipeline Tooling Upgrade',
    description: 'Upgrade to GitHub Actions Enterprise for faster build pipelines.',
    department: 'Engineering',
    category: 'Tool/Software',
    businessJustification: 'Current build times average 22 minutes. Upgrade will reduce to 8 minutes, saving ~2 hours/dev/day.',
    estimatedCost: 5000,
    status: 'APPROVED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(50),
    createdAt: daysAgo(55),
  })
  await prisma.decision.create({
    data: {
      projectRequestId: r13.id,
      outcome: 'APPROVED',
      rationale: 'Essential infrastructure investment. Will reduce build times by 63%. Strong ROI at this cost.',
      decidedByUserId: approver.id,
      decidedAt: daysAgo(25),
    },
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r13.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(55) },
      { projectRequestId: r13.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(50) },
      { projectRequestId: r13.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(48) },
      { projectRequestId: r13.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(48) },
      { projectRequestId: r13.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(30) },
      { projectRequestId: r13.id, actorUserId: approver.id, eventType: 'DECISION_RECORDED', newValue: 'APPROVED', createdAt: daysAgo(25) },
      { projectRequestId: r13.id, actorUserId: approver.id, eventType: 'STATUS_CHANGED', oldValue: 'READY_FOR_DECISION', newValue: 'APPROVED', createdAt: daysAgo(25) },
    ],
  })

  // 14. REJECTED — Executive Travel Upgrade
  const r14 = await createRequest({
    title: 'Executive Travel Policy Upgrade',
    description: 'Upgrade travel policy for VP+ to include business class on flights over 4 hours.',
    department: 'Operations',
    category: 'Budget Approval',
    businessJustification: 'Competitive benefit for executive retention. Estimated cost per person is $8,000/year.',
    estimatedCost: 50000,
    status: 'REJECTED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(45),
    createdAt: daysAgo(50),
  })
  await prisma.decision.create({
    data: {
      projectRequestId: r14.id,
      outcome: 'REJECTED',
      rationale: 'Current travel budget is adequate. This upgrade is not justified given current business conditions and cost-cutting priorities.',
      decidedByUserId: approver.id,
      decidedAt: daysAgo(20),
    },
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r14.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(50) },
      { projectRequestId: r14.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(45) },
      { projectRequestId: r14.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(43) },
      { projectRequestId: r14.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(43) },
      { projectRequestId: r14.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(25) },
      { projectRequestId: r14.id, actorUserId: approver.id, eventType: 'DECISION_RECORDED', newValue: 'REJECTED', createdAt: daysAgo(20) },
      { projectRequestId: r14.id, actorUserId: approver.id, eventType: 'STATUS_CHANGED', oldValue: 'READY_FOR_DECISION', newValue: 'REJECTED', createdAt: daysAgo(20) },
    ],
  })
  await prisma.comment.create({
    data: {
      projectRequestId: r14.id,
      authorUserId: approver.id,
      body: 'Appreciated the proposal. Unfortunately we cannot support this level of travel spending given current priorities.',
      type: 'GENERAL',
      createdAt: daysAgo(20),
    },
  })

  // 15. DEFERRED — New HQ Office Build-Out
  const r15 = await createRequest({
    title: 'New HQ Office Build-Out',
    description: 'Lease and build-out of a new headquarters at downtown location.',
    department: 'Operations',
    category: 'Infrastructure',
    businessJustification: 'Current lease expires in 18 months. New space supports projected 40% headcount growth.',
    estimatedCost: 500000,
    priority: 'High',
    status: 'DEFERRED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(60),
    createdAt: daysAgo(65),
  })
  await prisma.decision.create({
    data: {
      projectRequestId: r15.id,
      outcome: 'DEFERRED',
      rationale: 'Strategic direction on office strategy must be finalized by leadership first. Revisit once 3-year growth plan is confirmed.',
      decidedByUserId: approver.id,
      decidedAt: daysAgo(35),
      nextReviewDate: daysFromNow(180),
    },
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r15.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(65) },
      { projectRequestId: r15.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(60) },
      { projectRequestId: r15.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(58) },
      { projectRequestId: r15.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(58) },
      { projectRequestId: r15.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(40) },
      { projectRequestId: r15.id, actorUserId: approver.id, eventType: 'DECISION_RECORDED', newValue: 'DEFERRED', createdAt: daysAgo(35) },
      { projectRequestId: r15.id, actorUserId: approver.id, eventType: 'STATUS_CHANGED', oldValue: 'READY_FOR_DECISION', newValue: 'DEFERRED', createdAt: daysAgo(35) },
    ],
  })

  // 16. DEFERRED — Q3 Engineering Headcount
  const r16 = await createRequest({
    title: 'Q3 Engineering Headcount Expansion',
    description: 'Hire 4 senior engineers to support product roadmap acceleration.',
    department: 'Engineering',
    category: 'Headcount',
    businessJustification: 'Current team is at capacity. 4 key roadmap features are blocked on headcount.',
    status: 'DEFERRED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(40),
    createdAt: daysAgo(45),
  })
  await prisma.decision.create({
    data: {
      projectRequestId: r16.id,
      outcome: 'DEFERRED',
      rationale: 'Headcount planning for Q3 is pending executive budget review. Resubmit after annual planning is complete.',
      decidedByUserId: approver.id,
      decidedAt: daysAgo(18),
      nextReviewDate: daysFromNow(90),
    },
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r16.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(45) },
      { projectRequestId: r16.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(40) },
      { projectRequestId: r16.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(38) },
      { projectRequestId: r16.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(38) },
      { projectRequestId: r16.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(22) },
      { projectRequestId: r16.id, actorUserId: approver.id, eventType: 'DECISION_RECORDED', newValue: 'DEFERRED', createdAt: daysAgo(18) },
      { projectRequestId: r16.id, actorUserId: approver.id, eventType: 'STATUS_CHANGED', oldValue: 'READY_FOR_DECISION', newValue: 'DEFERRED', createdAt: daysAgo(18) },
    ],
  })

  // 17. APPROVED — Compliance Audit System
  const r17 = await createRequest({
    title: 'Compliance Audit Management System',
    description: 'Automate evidence collection and audit trail management for SOC 2 compliance.',
    department: 'Legal',
    category: 'Tool/Software',
    businessJustification: 'Manual evidence collection for SOC 2 takes 3 weeks/year. Automated tool reduces to 3 days.',
    estimatedCost: 28000,
    priority: 'High',
    status: 'APPROVED',
    requesterUserId: requester.id,
    assignedReviewerUserId: reviewer.id,
    submittedAt: daysAgo(55),
    createdAt: daysAgo(60),
  })
  await prisma.decision.create({
    data: {
      projectRequestId: r17.id,
      outcome: 'APPROVED',
      rationale: 'Compliance requirement. Must implement before year-end SOC 2 audit. Strong cost justification.',
      decidedByUserId: approver.id,
      decidedAt: daysAgo(28),
    },
  })
  await prisma.auditEvent.createMany({
    data: [
      { projectRequestId: r17.id, actorUserId: requester.id, eventType: 'CREATED', createdAt: daysAgo(60) },
      { projectRequestId: r17.id, actorUserId: requester.id, eventType: 'STATUS_CHANGED', oldValue: 'DRAFT', newValue: 'SUBMITTED', createdAt: daysAgo(55) },
      { projectRequestId: r17.id, actorUserId: reviewer.id, eventType: 'ASSIGNMENT_CHANGED', oldValue: null, newValue: 'Reviewer1', createdAt: daysAgo(53) },
      { projectRequestId: r17.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'SUBMITTED', newValue: 'UNDER_REVIEW', createdAt: daysAgo(53) },
      { projectRequestId: r17.id, actorUserId: reviewer.id, eventType: 'STATUS_CHANGED', oldValue: 'UNDER_REVIEW', newValue: 'READY_FOR_DECISION', createdAt: daysAgo(32) },
      { projectRequestId: r17.id, actorUserId: approver.id, eventType: 'DECISION_RECORDED', newValue: 'APPROVED', createdAt: daysAgo(28) },
      { projectRequestId: r17.id, actorUserId: approver.id, eventType: 'STATUS_CHANGED', oldValue: 'READY_FOR_DECISION', newValue: 'APPROVED', createdAt: daysAgo(28) },
    ],
  })

  console.log('Seed complete: 4 users, 17 requests')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
