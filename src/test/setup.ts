import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';

// PBT-08 재현성: CI에서 FC_SEED 지정 시 시드 고정. numRuns 100 (NFR-U0-TEST-02).
const seed = process.env.FC_SEED ? Number(process.env.FC_SEED) : undefined;
fc.configureGlobal({
  numRuns: 100,
  ...(seed !== undefined ? { seed } : {}),
});
