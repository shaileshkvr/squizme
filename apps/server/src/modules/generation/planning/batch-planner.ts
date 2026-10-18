export interface PlannedBatchTopic {
  topicName: string;
  questionCount: number;
}

export interface PlannedBatch {
  batchNumber: number;
  plannedQuestionCount: number;
  topicAllocation: PlannedBatchTopic[];
}

export interface PlanBatchesInput {
  totalQuestions: number;
  maxBatchSize: number;
  topics: Array<{ name: string; questionCount: number }>;
}

export function planBatches(input: PlanBatchesInput): PlannedBatch[] {
  const { totalQuestions, maxBatchSize, topics } = input;

  if (totalQuestions <= 0) {
    throw new Error("totalQuestions must be a positive integer");
  }
  if (maxBatchSize <= 0) {
    throw new Error("maxBatchSize must be a positive integer");
  }
  if (!topics || topics.length === 0) {
    throw new Error("topics array must not be empty");
  }

  const topicSum = topics.reduce((acc, t) => acc + t.questionCount, 0);
  if (topicSum !== totalQuestions) {
    throw new Error(
      `Sum of topic counts (${topicSum}) must equal total questions requested (${totalQuestions})`
    );
  }

  // 1. Compute batch count: B = ceil(N / M)
  const batchCount = Math.ceil(totalQuestions / maxBatchSize);

  // 2. Compute base batch size: base = floor(N / B)
  const baseBatchSize = Math.floor(totalQuestions / batchCount);

  // 3. Compute remainder: r = N mod B
  // First r batches have base + 1, remaining have base
  const remainder = totalQuestions % batchCount;

  const batchCapacities: number[] = [];
  for (let i = 0; i < batchCount; i++) {
    batchCapacities.push(i < remainder ? baseBatchSize + 1 : baseBatchSize);
  }

  // 4. Sort topics descending by allocation for balanced assignment
  const sortedTopics = [...topics]
    .filter((t) => t.questionCount > 0)
    .sort((a, b) => b.questionCount - a.questionCount)
    .map((t) => ({ name: t.name, remaining: t.questionCount }));

  const batches: PlannedBatch[] = batchCapacities.map((capacity, index) => ({
    batchNumber: index + 1,
    plannedQuestionCount: capacity,
    topicAllocation: [],
  }));

  // 5. Greedy fill: fill each batch to capacity with topic slots
  let currentBatchIndex = 0;
  let batchRemainingCapacity = batches[0].plannedQuestionCount;

  for (const topic of sortedTopics) {
    while (topic.remaining > 0) {
      if (currentBatchIndex >= batches.length) {
        throw new Error("Capacity overflow during batch planning");
      }

      const alloc = Math.min(topic.remaining, batchRemainingCapacity);
      if (alloc > 0) {
        batches[currentBatchIndex].topicAllocation.push({
          topicName: topic.name,
          questionCount: alloc,
        });
        topic.remaining -= alloc;
        batchRemainingCapacity -= alloc;
      }

      if (batchRemainingCapacity === 0 && currentBatchIndex < batches.length - 1) {
        currentBatchIndex++;
        batchRemainingCapacity = batches[currentBatchIndex].plannedQuestionCount;
      }
    }
  }

  // 6. Invariant verification
  let totalAllocated = 0;
  for (const b of batches) {
    const batchSum = b.topicAllocation.reduce((acc, t) => acc + t.questionCount, 0);
    if (batchSum !== b.plannedQuestionCount) {
      throw new Error(
        `Batch ${b.batchNumber} topic allocation sum (${batchSum}) does not match planned count (${b.plannedQuestionCount})`
      );
    }
    if (b.plannedQuestionCount > maxBatchSize) {
      throw new Error(
        `Batch ${b.batchNumber} size (${b.plannedQuestionCount}) exceeds maxBatchSize (${maxBatchSize})`
      );
    }
    totalAllocated += b.plannedQuestionCount;
  }

  if (totalAllocated !== totalQuestions) {
    throw new Error(
      `Total batch allocation sum (${totalAllocated}) does not match total requested questions (${totalQuestions})`
    );
  }

  return batches;
}
