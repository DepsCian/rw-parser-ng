# Benchmarks

Run `bun run build` then `bun run bench`. The harness measures compiled package code with preloaded fixtures, a warmup, and seven timed batches. JSON output includes median latency, runtime, input size, consumed bytes where available, and codec output throughput. Results are consumed to retain observable work.

CI uploads the JSON report and adds a job summary. Timing changes are informational; workload errors fail the job. No absolute performance threshold is enforced on shared runners. Compare the same workloads and runtime on the same machine. File throughput is not equivalent to processed throughput when a parser leaves bytes unread.

Generated codec blocks use deterministic values. Fixtures cover DFF, TXD, IFP, and FXP. Cursor cases isolate scalar reads and byte copying. Benchmarks are development tools and are excluded from the published package.
