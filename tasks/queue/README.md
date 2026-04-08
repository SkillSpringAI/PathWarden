# Task Queue

Stores pending and scheduled Pathwarden tasks.

Tasks should be:
- visible to the user
- reviewable before execution
- cancellable
- mode-bounded
- auditable

Mutating tasks should never execute silently without explicit policy support.
