import "@testing-library/jest-dom/vitest"

type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };