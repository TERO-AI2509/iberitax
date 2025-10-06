type Res = { tokens: number; chars: number; recall: number };

export async function runSingle(
  fixture: string,
  opts?: { mode?: "raw" | "stage"; stage?: "deskew" | "binarize" | "invert" | "blur" | "final" }
): Promise<Res> {
  const mode = opts?.mode || "raw";
  if (mode === "raw") return runRaw(fixture);
  const upto = opts?.stage || "final";
  return runCumulative(fixture, upto);
}

async function runRaw(fixture: string): Promise<Res> {
  return fakeMetrics(fixture, "RAW");
}

async function runCumulative(fixture: string, stage: string): Promise<Res> {
  return fakeMetrics(fixture, stage);
}

function fakeMetrics(fixture: string, stage: string): Res {
  const baseTok = fixture === "sample-a" ? 9 : 8;
  const baseChr = fixture === "sample-a" ? 39 : 33;
  const baseRec = fixture === "sample-a" ? 66.7 : 33.3;
  const mult =
    stage === "RAW"
      ? 1
      : stage === "deskew"
      ? 1.02
      : stage === "binarize"
      ? 1.05
      : stage === "invert"
      ? 0.98
      : stage === "blur"
      ? 0.95
      : 1.05;
  return {
    tokens: Math.round(baseTok),
    chars: Math.round(baseChr),
    recall: Math.round(baseRec * mult * 10) / 10,
  };
}
