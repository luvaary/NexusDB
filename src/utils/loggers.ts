export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  metadata?: any;
}

export class Logger {
  private level: LogLevel;
  private context?: string;

  constructor(level: LogLevel = LogLevel.INFO, context?: string) {
    this.level = level;
    this.context = context;
  }

  debug(message: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: any): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      metadata,
    };

    const levelName = LogLevel[level];
    const contextStr = this.context ? `[${this.context}]` : '';
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';

    console.log(
      `${entry.timestamp.toISOString()} ${levelName}${contextStr} ${message}${metadataStr}`
    );
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setContext(context: string): void {
    this.context = context;
  }

  child(context: string): Logger {
    return new Logger(this.level, context);
  }
}

export const createLogger = (context?: string, level?: LogLevel): Logger => {
  return new Logger(level, context);
};
