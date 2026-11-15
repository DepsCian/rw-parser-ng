import { appendFileSync } from "node:fs";
import { workloads } from "./cases";

let sink = 0;
const results = workloads().map((workload) => {
  const warmupEnd = performance.now() + 200;
  while (performance.now() < warmupEnd) sink += workload.run();
  const samples: number[] = [];
  for (let batch = 0; batch < 7; batch++) {
    const start = performance.now();
    let iterations = 0;
    do {
      sink += workload.run();
      iterations++;
    } while (performance.now() - start < 75);
    samples.push((performance.now() - start) / iterations);
  }
  samples.sort((a, b) => a - b);
  const medianMs = samples[3];
  if (!Number.isFinite(sink) || !(medianMs > 0))
    throw new Error(`Invalid workload: ${workload.name}`);
  return {
    name: workload.name,
    inputBytes: workload.inputBytes,
    consumedBytes: workload.consumedBytes,
    outputBytes: workload.outputBytes,
    medianMs,
    inputMBps: workload.inputBytes / medianMs / 1000,
    consumedMBps:
      workload.consumedBytes === undefined ? undefined : workload.consumedBytes / medianMs / 1000,
    outputMBps:
      workload.outputBytes === undefined ? undefined : workload.outputBytes / medianMs / 1000,
  };
});
console.log(
  JSON.stringify(
    { runtime: `Bun ${Bun.version}`, commit: process.env.GITHUB_SHA ?? null, sink, results },
    null,
    2,
  ),
);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## Benchmarks (Bun ${Bun.version})\n\n| Workload | Median ms | Input MB/s | Consumed bytes |\n| --- | ---: | ---: | ---: |\n` +
      results
        .map(
          (r) =>
            `| ${r.name} | ${r.medianMs.toFixed(4)} | ${r.inputMBps.toFixed(1)} | ${r.consumedBytes ?? "n/a"} |`,
        )
        .join("\n") +
      "\n",
  );
}
