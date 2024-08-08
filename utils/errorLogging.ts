// src/utils/errorLogging.ts

export function ApplicationLogError(functionName: string, errorMessage: string, error: unknown): void {
    console.error(`[${functionName}] ${errorMessage}:`, error);
  }