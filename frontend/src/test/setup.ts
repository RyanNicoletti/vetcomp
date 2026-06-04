import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock import.meta.env.VITE_API_BASE_URL so queries don't blow up if invoked
// (Vitest exposes import.meta.env via vite config, but provide a safe default.)
if (!import.meta.env.VITE_API_BASE_URL) {
  (import.meta.env as any).VITE_API_BASE_URL = "http://localhost:3000/api";
}

afterEach(() => {
  cleanup();
});
