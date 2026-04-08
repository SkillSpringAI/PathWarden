export type DiagnosticSeverity = "fatal" | "warn" | "info";
export type DiagnosticStatus = "pass" | "fail" | "warn";

export interface DiagnosticResult {
  id: string;
  name: string;
  severity: DiagnosticSeverity;
  status: DiagnosticStatus;
  detail: string;
}

export interface DiagnosticReport {
  run_id: string;
  timestamp: string;
  overall_status: "pass" | "fail" | "warn";
  results: DiagnosticResult[];
}
