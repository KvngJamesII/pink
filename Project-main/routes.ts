import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTaskSchema, insertTaskSubmissionSchema, insertTransactionSchema, insertNotificationSchema, insertReferralSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

// Helper function to generate random codes
function generateReferralCode(): string {
  return `QR${Math.floor(100000 + Math.random() * 900000)}`;
}

// Helper to check if the user already completed a task
async function hasUserCompletedTask(userId: number, taskId: number): Promise<boolean> {
  const submissions = await storage.getSubmissionsByUser(userId);
  return submissions.some(submission => submission.taskId === taskId);
}

// Format the email to hide some characters
function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }
  return `${username.substring(0, 3)}***@${domain}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.extend({
        password: z.string().length(6),
        referredBy: z.string().optional(),
      }).parse({
        ...req.body,
        referralCode: generateReferralCode()
      });

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userInput.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check referral code if provided
      let referrer = null;
      if (userInput.referredBy) {
        referrer = await storage.getUserByReferralCode(userInput.referredBy);
        if (!referrer) {
          return res.status(400).json({ message: "Invalid referral code" });
        }
      }

      // Create user
      const newUser = await storage.createUser(userInput);

      // Create referral relationship if referrer exists
      if (referrer) {
        await storage.createReferral({
          referrerId: referrer.id,
          referredId: newUser.id
        });

        // Notify referrer
        await storage.createNotification({
          userId: referrer.id,
          message: "You have a new referral"
        });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string().length(6),
      }).parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.isBanned) {
        return res.status(403).json({ message: "Your account has been banned" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getAvailableTasks();
      
      // Get owner info and format response
      const tasksWithOwner = await Promise.all(tasks.map(async (task) => {
        const owner = await storage.getUser(task.ownerId);
        return {
          ...task,
          ownerEmail: owner ? maskEmail(owner.email) : "Unknown",
        };
      }));
      
      return res.status(200).json(tasksWithOwner);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const owner = await storage.getUser(task.ownerId);
      
      return res.status(200).json({
        ...task,
        ownerEmail: owner ? maskEmail(owner.email) : "Unknown",
      });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { userId, ...taskData } = insertTaskSchema.parse({
        ...req.body,
        ownerId: parseInt(req.body.userId),
      });
      
      // Check if user exists
      const user = await storage.getUser(taskData.ownerId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate total cost
      const totalCost = taskData.pricePerUser * taskData.totalSlots;
      
      // Check if user has enough funds
      if (user.walletBalance < totalCost) {
        return res.status(400).json({ message: "Insufficient funds, please fund your wallet" });
      }
      
      // Deduct amount from user's wallet
      await storage.updateUserBalances(user.id, user.walletBalance - totalCost);
      
      // Create task
      const newTask = await storage.createTask(taskData);
      
      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: "task_debit",
        amount: totalCost,
        status: "completed"
      });
      
      return res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Task submission routes
  app.post("/api/tasks/:id/submit", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const { userId, proofText, proofImage } = insertTaskSubmissionSchema.parse({
        ...req.body,
        taskId,
        userId: parseInt(req.body.userId),
      });
      
      // Check if task exists and is active
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (!task.isActive) {
        return res.status(400).json({ message: "This task is no longer active" });
      }
      
      if (task.filledSlots >= task.totalSlots) {
        return res.status(400).json({ message: "All slots for this task have been filled" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is the task owner
      if (task.ownerId === userId) {
        return res.status(400).json({ message: "You cannot complete your own task" });
      }
      
      // Check if user already completed this task
      if (await hasUserCompletedTask(userId, taskId)) {
        return res.status(400).json({ message: "You have already submitted a proof for this task" });
      }
      
      // Create submission
      const submission = await storage.createTaskSubmission({
        taskId,
        userId,
        proofText,
        proofImage,
      });
      
      // Notify task owner
      await storage.createNotification({
        userId: task.ownerId,
        message: "A user has completed your task. Please click to review."
      });
      
      return res.status(201).json(submission);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Review submission routes
  app.post("/api/submissions/:id/review", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { status, reviewerId } = z.object({
        status: z.enum(["approved", "rejected"]),
        reviewerId: z.number(),
      }).parse(req.body);
      
      // Check if submission exists
      const submission = await storage.getTaskSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Check if submission is already reviewed
      if (submission.status !== "pending") {
        return res.status(400).json({ message: "This submission has already been reviewed" });
      }
      
      // Get task to check if reviewer is the owner
      const task = await storage.getTask(submission.taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.ownerId !== reviewerId) {
        return res.status(403).json({ message: "You are not authorized to review this submission" });
      }
      
      // Update submission status
      const updatedSubmission = await storage.updateSubmissionStatus(submissionId, status);
      
      // If approved, process the payment and update task slots
      if (status === "approved") {
        // Get user
        const user = await storage.getUser(submission.userId);
        if (user) {
          // Credit user's withdrawable balance
          await storage.updateUserBalances(
            user.id, 
            undefined, 
            user.withdrawableBalance + task.pricePerUser
          );
          
          // Create transaction record
          await storage.createTransaction({
            userId: user.id,
            type: "task_credit",
            amount: task.pricePerUser,
            status: "completed"
          });
          
          // Send notification to user
          await storage.createNotification({
            userId: user.id,
            message: "Your Task Has Been Approved."
          });
          
          // Update task slots
          await storage.updateTaskSlots(task.id, task.filledSlots + 1);
          
          // If all slots are filled, deactivate the task
          if (task.filledSlots + 1 >= task.totalSlots) {
            await storage.deactivateTask(task.id);
          }
        }
      } else {
        // If rejected, notify the user
        await storage.createNotification({
          userId: submission.userId,
          message: "Your task submission was rejected."
        });
      }
      
      return res.status(200).json(updatedSubmission);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // User's task submissions
  app.get("/api/users/:id/submissions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's submissions
      const submissions = await storage.getSubmissionsByUser(userId);
      
      // Enrich with task data
      const enrichedSubmissions = await Promise.all(
        submissions.map(async (submission) => {
          const task = await storage.getTask(submission.taskId);
          return {
            ...submission,
            task: task || { name: "Unknown Task" }
          };
        })
      );
      
      return res.status(200).json(enrichedSubmissions);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Task owner's pending submissions
  app.get("/api/users/:id/review-submissions", async (req: Request, res: Response) => {
    try {
      const ownerId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(ownerId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get pending submissions for owner's tasks
      const pendingSubmissions = await storage.getPendingSubmissionsForOwner(ownerId);
      
      // Enrich with user data
      const enrichedSubmissions = await Promise.all(
        pendingSubmissions.map(async ({ submission, task }) => {
          const submitter = await storage.getUser(submission.userId);
          return {
            submission,
            task,
            submitterEmail: submitter ? maskEmail(submitter.email) : "Unknown"
          };
        })
      );
      
      return res.status(200).json(enrichedSubmissions);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Wallet routes
  app.post("/api/wallet/fund", async (req: Request, res: Response) => {
    try {
      const { userId, amount, paymentName, paymentReceipt } = insertTransactionSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        type: "deposit",
        status: "pending",
      });
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create deposit transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount,
        status: "pending",
        paymentName,
        paymentReceipt
      });
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/wallet/withdraw", async (req: Request, res: Response) => {
    try {
      const { userId, amount, network, phoneNumber } = insertTransactionSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        type: "withdrawal",
        status: "pending",
      });
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough withdrawable balance
      if (user.withdrawableBalance < amount) {
        return res.status(400).json({ message: "Insufficient withdrawable balance" });
      }
      
      // Validate phone number (must be 11 digits)
      if (!phoneNumber || phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number. Must be 11 digits" });
      }
      
      // Create withdrawal transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount,
        status: "pending",
        network,
        phoneNumber
      });
      
      // Reduce user's withdrawable balance
      await storage.updateUserBalances(
        userId, 
        undefined, 
        user.withdrawableBalance - amount
      );
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Transaction routes
  app.get("/api/users/:id/transactions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string || "1");
      const limit = 10;
      const offset = (page - 1) * limit;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's transactions
      const transactions = await storage.getTransactionsByUser(userId, limit, offset);
      const totalCount = await storage.countTransactionsByUser(userId);
      
      return res.status(200).json({
        transactions,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          page,
          limit
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Notification routes
  app.get("/api/users/:id/notifications", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's notifications
      const notifications = await storage.getNotifications(userId);
      
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/users/:id/unread-notifications", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get unread notification count
      const count = await storage.getUnreadNotificationCount(userId);
      
      return res.status(200).json({ count });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      // Mark notification as read
      const notification = await storage.markNotificationAsRead(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.status(200).json(notification);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/users/:id/read-all-notifications", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Mark all notifications as read
      await storage.markAllNotificationsAsRead(userId);
      
      return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Referral routes
  app.get("/api/users/:id/referrals", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's referrals
      const referrals = await storage.getReferralsByReferrer(userId);
      const referralCount = referrals.length;
      const earnings = await storage.getReferralEarnings(userId);
      
      return res.status(200).json({
        referrals,
        count: referralCount,
        earnings
      });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const adminId = parseInt(req.query.adminId as string);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get all users
      const users = await storage.getAllUsers();
      
      // Remove passwords
      const safeUsers = users.map(({ password, ...user }) => user);
      
      return res.status(200).json(safeUsers);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/admin/ban-user", async (req: Request, res: Response) => {
    try {
      const { adminId, userId, isBanned } = z.object({
        adminId: z.number(),
        userId: z.number(),
        isBanned: z.boolean()
      }).parse(req.body);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Ban/unban user
      const updatedUser = await storage.banUser(userId, isBanned);
      
      // Remove password
      if (updatedUser) {
        const { password, ...safeUser } = updatedUser;
        return res.status(200).json(safeUser);
      }
      
      return res.status(404).json({ message: "User not found" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/admin/update-balance", async (req: Request, res: Response) => {
    try {
      const { adminId, userId, walletBalance, withdrawableBalance } = z.object({
        adminId: z.number(),
        userId: z.number(),
        walletBalance: z.number().optional(),
        withdrawableBalance: z.number().optional()
      }).parse(req.body);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update balances
      const updatedUser = await storage.updateUserBalances(
        userId, 
        walletBalance !== undefined ? walletBalance : user.walletBalance,
        withdrawableBalance !== undefined ? withdrawableBalance : user.withdrawableBalance
      );
      
      // Remove password
      if (updatedUser) {
        const { password, ...safeUser } = updatedUser;
        return res.status(200).json(safeUser);
      }
      
      return res.status(404).json({ message: "User not found" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/admin/deposit-requests", async (req: Request, res: Response) => {
    try {
      const adminId = parseInt(req.query.adminId as string);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get deposit requests
      const deposits = await storage.getDepositRequests();
      
      // Enrich with user data
      const enrichedDeposits = await Promise.all(
        deposits.map(async (deposit) => {
          const user = await storage.getUser(deposit.userId);
          return {
            ...deposit,
            userEmail: user ? user.email : "Unknown"
          };
        })
      );
      
      return res.status(200).json(enrichedDeposits);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/admin/withdrawal-requests", async (req: Request, res: Response) => {
    try {
      const adminId = parseInt(req.query.adminId as string);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get withdrawal requests
      const withdrawals = await storage.getWithdrawalRequests();
      
      // Enrich with user data
      const enrichedWithdrawals = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          const user = await storage.getUser(withdrawal.userId);
          return {
            ...withdrawal,
            userEmail: user ? user.email : "Unknown"
          };
        })
      );
      
      return res.status(200).json(enrichedWithdrawals);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/admin/approve-deposit", async (req: Request, res: Response) => {
    try {
      const { adminId, transactionId } = z.object({
        adminId: z.number(),
        transactionId: z.number()
      }).parse(req.body);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.type !== "deposit" || transaction.status !== "pending") {
        return res.status(404).json({ message: "Transaction not found or not a pending deposit" });
      }
      
      // Update transaction status
      await storage.updateTransactionStatus(transactionId, "completed");
      
      // Get user
      const user = await storage.getUser(transaction.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate actual amount (deduct ₦100 service fee)
      const actualAmount = transaction.amount - 100;
      
      // Update user's wallet balance
      await storage.updateUserBalances(
        user.id, 
        user.walletBalance + actualAmount,
        undefined
      );
      
      // Create notification
      await storage.createNotification({
        userId: user.id,
        message: `Your deposit of ₦${transaction.amount} has been approved. ₦${actualAmount} added to your wallet after service fee.`
      });
      
      // Check for referrer to give bonus
      if (user.referredBy) {
        const referrer = await storage.getUserByReferralCode(user.referredBy);
        if (referrer) {
          // Fixed bonus amount of 25 naira
          const bonusAmount = 25;
          
          // Add bonus to referrer's withdrawable balance
          await storage.updateUserBalances(
            referrer.id,
            undefined,
            referrer.withdrawableBalance + bonusAmount
          );
          
          // Create transaction record for the bonus
          await storage.createTransaction({
            userId: referrer.id,
            type: "referral_bonus",
            amount: bonusAmount,
            status: "completed"
          });
          
          // Notify referrer
          await storage.createNotification({
            userId: referrer.id,
            message: `You just got a referral bonus of ₦${bonusAmount}.`
          });
        }
      }
      
      return res.status(200).json({ message: "Deposit approved successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/admin/reject-deposit", async (req: Request, res: Response) => {
    try {
      const { adminId, transactionId } = z.object({
        adminId: z.number(),
        transactionId: z.number()
      }).parse(req.body);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.type !== "deposit" || transaction.status !== "pending") {
        return res.status(404).json({ message: "Transaction not found or not a pending deposit" });
      }
      
      // Update transaction status
      await storage.updateTransactionStatus(transactionId, "rejected");
      
      // Create notification
      await storage.createNotification({
        userId: transaction.userId,
        message: `Your deposit of ₦${transaction.amount} has been rejected.`
      });
      
      return res.status(200).json({ message: "Deposit rejected successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/admin/process-withdrawal", async (req: Request, res: Response) => {
    try {
      const { adminId, transactionId } = z.object({
        adminId: z.number(),
        transactionId: z.number()
      }).parse(req.body);
      
      // Check if admin exists and has admin rights
      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.type !== "withdrawal" || transaction.status !== "pending") {
        return res.status(404).json({ message: "Transaction not found or not a pending withdrawal" });
      }
      
      // Update transaction status
      await storage.updateTransactionStatus(transactionId, "completed");
      
      // Create notification
      await storage.createNotification({
        userId: transaction.userId,
        message: `Your withdrawal of ₦${transaction.amount} has been processed successfully.`
      });
      
      return res.status(200).json({ message: "Withdrawal processed successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  return httpServer;
}
