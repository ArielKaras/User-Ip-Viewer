export interface LogEntry {
    msg: string;
    status: number;
    duration: number;
    trace_id: string;
    level: 'info' | 'error' | 'warn';
    timestamp: string;
}

export interface MetricPoint {
    time: string;
    requests: number;
    errors: number;
    duration: number;
}
