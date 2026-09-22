import { pgTable, serial, text, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const bugReports = pgTable('bug_reports', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  currentSection: varchar('current_section', { length: 255 }).notNull(),
  recentActions: jsonb('recent_actions').$type<{ timestamp: string; action: string; section: string }[]>(),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('new').notNull(),
}, (table) => [
  index('bug_reports_status_idx').on(table.status),
  index('bug_reports_created_at_idx').on(table.createdAt),
]);
