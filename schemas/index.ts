import { z } from 'zod';
export const lineSchema = z
  .object({
    id: z.string(),
    itemId: z.string().optional(),
    description: z.string().optional(),
    uom: z.string().optional(),
    qty: z.number().finite().nonnegative().optional(),
    rate: z.number().finite().nonnegative().optional(),
    previous: z.number().finite().nonnegative().optional(),
    accountId: z.string().optional(),
    debit: z.number().finite().nonnegative().optional(),
    credit: z.number().finite().nonnegative().optional(),
    qtyRequested: z.object({ value: z.number().nonnegative(), uom: z.string() }).optional(),
    qtyApproved: z.object({ value: z.number(), uom: z.string() }).nullable().optional(),
    qtyIssued: z.object({ value: z.number(), uom: z.string() }).nullable().optional(),
  })
  .passthrough();
export const recordSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    number: z.string().optional(),
    status: z.string().optional(),
    purpose: z.string().optional(),
    priority: z.string().optional(),
    date: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    code: z.string().optional(),
    email: z.string().optional(),
    onHand: z.number().optional(),
    uom: z.string().optional(),
    sourceId: z.string().optional(),
    accountId: z.string().optional(),
    siteId: z.string().optional(),
    firmId: z.string().optional(),
    projectId: z.string().optional(),
    lines: z.array(lineSchema).optional(),
  })
  .passthrough();
export type RecordData = z.infer<typeof recordSchema>;
export type Line = z.infer<typeof lineSchema>;
export const userSchema = recordSchema.extend({
  name: z.string(),
  email: z.email(),
  role: z.string(),
  departmentId: z.string().optional(),
  roleId: z.string().optional(),
  employeeCode: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  siteIds: z.array(z.string()).optional(),
  partyId: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Enter the demo password.'),
});
