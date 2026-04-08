export interface TaskLock {
  task_id: string;
  owner_pid: number;
  created_at: string;
  expires_at: string;
}
