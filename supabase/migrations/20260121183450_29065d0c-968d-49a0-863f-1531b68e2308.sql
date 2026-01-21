-- Add new workflow statuses to request_status enum
-- pending_employee = waiting for employee to provide docs/info
-- escalated = escalated to manager/executive for approval

ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'pending_employee';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'escalated';