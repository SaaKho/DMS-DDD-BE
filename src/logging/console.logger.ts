// src/logging/ConsoleLogger.ts
import { Logger } from "./logger";

export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
  }
}
