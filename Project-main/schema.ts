import { pgTable, text, serial, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  walletBalance: integer("wallet_balance").notNull().default(0),
  withdrawableBalance: integer("withdrawable_balance").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  referralCode: true,
  referredBy: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  link: text("link").notNull(),
  pricePerUser: integer("price_per_user").notNull(),
  totalSlots: integer("total_slots").notNull(),
  filledSlots: integer("filled_slots").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    ownerIdIdx: index("owner_id_idx").on(table.ownerId),
  };
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  ownerId: true,
  name: true,
  description: true,
  link: true,
  pricePerUser: true,
  totalSlots: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Task Submission schema
export const taskSubmissions = pgTable("task_submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  proofText: text("proof_text"),
  proofImage: text("proof_image"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    taskIdIdx: index("task_id_idx").on(table.taskId),
    userIdIdx: index("user_id_idx").on(table.userId),
  };
});

export const insertTaskSubmissionSchema = createInsertSchema(taskSubmissions).pick({
  taskId: true,
  userId: true,
  proofText: true,
  proofImage: true,
});

export type InsertTaskSubmission = z.infer<typeof insertTaskSubmissionSchema>;
export type TaskSubmission = typeof taskSubmissions.$inferSelect;

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, task_credit, task_debit, referral_bonus
  amount: integer("amount").notNull(),
  status: text("status").notNull(), // pending, completed, rejected
  network: text("network"), // For withdrawals: MTN, Airtel, Glo, 9mobile
  phoneNumber: text("phone_number"), // For withdrawals
  paymentName: text("payment_name"), // For deposits
  paymentReceipt: text("payment_receipt"), // For deposits
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("user_id_idx").on(table.userId),
  };
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
  network: true,
  phoneNumber: true,
  paymentName: true,
  paymentReceipt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("user_id_idx").on(table.userId),
  };
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Referral schema
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    referrerIdIdx: index("referrer_id_idx").on(table.referrerId),
    referredIdIdx: index("referred_id_idx").on(table.referredId),
  };
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerId: true,
  referredId: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
