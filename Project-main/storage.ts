import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask, 
  taskSubmissions, type TaskSubmission, type InsertTaskSubmission,
  transactions, type Transaction, type InsertTransaction,
  notifications, type Notification, type InsertNotification,
  referrals, type Referral, type InsertReferral
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalances(id: number, walletBalance?: number, withdrawableBalance?: number): Promise<User | undefined>;
  banUser(id: number, isBanned: boolean): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByOwner(ownerId: number): Promise<Task[]>;
  getAvailableTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskSlots(id: number, filledSlots: number): Promise<Task | undefined>;
  deactivateTask(id: number): Promise<Task | undefined>;
  
  // Task Submission methods
  getTaskSubmission(id: number): Promise<TaskSubmission | undefined>;
  getSubmissionsByTask(taskId: number): Promise<TaskSubmission[]>;
  getSubmissionsByUser(userId: number): Promise<TaskSubmission[]>;
  getPendingSubmissionsForOwner(ownerId: number): Promise<{ submission: TaskSubmission, task: Task }[]>;
  createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission>;
  updateSubmissionStatus(id: number, status: string): Promise<TaskSubmission | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number, limit?: number, offset?: number): Promise<Transaction[]>;
  getDepositRequests(): Promise<Transaction[]>;
  getWithdrawalRequests(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  countTransactionsByUser(userId: number): Promise<number>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Referral methods
  getReferralsByReferrer(referrerId: number): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralCount(referrerId: number): Promise<number>;
  getReferralEarnings(referrerId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private tasksData: Map<number, Task>;
  private taskSubmissionsData: Map<number, TaskSubmission>;
  private transactionsData: Map<number, Transaction>;
  private notificationsData: Map<number, Notification>;
  private referralsData: Map<number, Referral>;
  private userId: number;
  private taskId: number;
  private submissionId: number;
  private transactionId: number;
  private notificationId: number;
  private referralId: number;

  constructor() {
    this.usersData = new Map();
    this.tasksData = new Map();
    this.taskSubmissionsData = new Map();
    this.transactionsData = new Map();
    this.notificationsData = new Map();
    this.referralsData = new Map();
    this.userId = 1;
    this.taskId = 1;
    this.submissionId = 1;
    this.transactionId = 1;
    this.notificationId = 1;
    this.referralId = 1;
    
    // Create admin user
    this.createUser({
      email: "mike@gmail.com",
      password: "isr828",
      referralCode: "ADMIN1",
      referredBy: null
    }).then(user => {
      this.updateUserFieldById(user.id, "isAdmin", true);
    });
  }

  private updateUserFieldById(id: number, field: keyof User, value: any): User | undefined {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, [field]: value };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = {
      id,
      email: user.email,
      password: user.password,
      walletBalance: 0,
      withdrawableBalance: 0,
      referralCode: user.referralCode,
      referredBy: user.referredBy || null,
      isAdmin: false,
      isBanned: false,
      createdAt: new Date()
    };
    this.usersData.set(id, newUser);
    return newUser;
  }

  async updateUserBalances(id: number, walletBalance?: number, withdrawableBalance?: number): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      walletBalance: walletBalance !== undefined ? walletBalance : user.walletBalance,
      withdrawableBalance: withdrawableBalance !== undefined ? withdrawableBalance : user.withdrawableBalance
    };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  async banUser(id: number, isBanned: boolean): Promise<User | undefined> {
    return this.updateUserFieldById(id, "isBanned", isBanned);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksData.get(id);
  }

  async getTasksByOwner(ownerId: number): Promise<Task[]> {
    return Array.from(this.tasksData.values()).filter(
      (task) => task.ownerId === ownerId
    );
  }

  async getAvailableTasks(): Promise<Task[]> {
    return Array.from(this.tasksData.values()).filter(
      (task) => task.isActive && task.filledSlots < task.totalSlots
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const newTask: Task = {
      id,
      ownerId: task.ownerId,
      name: task.name,
      description: task.description,
      link: task.link,
      pricePerUser: task.pricePerUser,
      totalSlots: task.totalSlots,
      filledSlots: 0,
      isActive: true,
      createdAt: new Date()
    };
    this.tasksData.set(id, newTask);
    return newTask;
  }

  async updateTaskSlots(id: number, filledSlots: number): Promise<Task | undefined> {
    const task = this.tasksData.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, filledSlots };
    this.tasksData.set(id, updatedTask);
    return updatedTask;
  }

  async deactivateTask(id: number): Promise<Task | undefined> {
    const task = this.tasksData.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, isActive: false };
    this.tasksData.set(id, updatedTask);
    return updatedTask;
  }

  // Task Submission methods
  async getTaskSubmission(id: number): Promise<TaskSubmission | undefined> {
    return this.taskSubmissionsData.get(id);
  }

  async getSubmissionsByTask(taskId: number): Promise<TaskSubmission[]> {
    return Array.from(this.taskSubmissionsData.values()).filter(
      (submission) => submission.taskId === taskId
    );
  }

  async getSubmissionsByUser(userId: number): Promise<TaskSubmission[]> {
    return Array.from(this.taskSubmissionsData.values()).filter(
      (submission) => submission.userId === userId
    );
  }

  async getPendingSubmissionsForOwner(ownerId: number): Promise<{ submission: TaskSubmission, task: Task }[]> {
    const ownerTasks = await this.getTasksByOwner(ownerId);
    const result: { submission: TaskSubmission, task: Task }[] = [];
    
    for (const task of ownerTasks) {
      const submissions = await this.getSubmissionsByTask(task.id);
      const pendingSubmissions = submissions.filter(sub => sub.status === "pending");
      
      for (const submission of pendingSubmissions) {
        result.push({ submission, task });
      }
    }
    
    return result;
  }

  async createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission> {
    const id = this.submissionId++;
    const newSubmission: TaskSubmission = {
      id,
      taskId: submission.taskId,
      userId: submission.userId,
      proofText: submission.proofText || null,
      proofImage: submission.proofImage || null,
      status: "pending",
      createdAt: new Date()
    };
    this.taskSubmissionsData.set(id, newSubmission);
    return newSubmission;
  }

  async updateSubmissionStatus(id: number, status: string): Promise<TaskSubmission | undefined> {
    const submission = this.taskSubmissionsData.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, status };
    this.taskSubmissionsData.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsData.get(id);
  }

  async getTransactionsByUser(userId: number, limit = 10, offset = 0): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactionsData.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return userTransactions.slice(offset, offset + limit);
  }

  async getDepositRequests(): Promise<Transaction[]> {
    return Array.from(this.transactionsData.values())
      .filter(transaction => transaction.type === "deposit" && transaction.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getWithdrawalRequests(): Promise<Transaction[]> {
    return Array.from(this.transactionsData.values())
      .filter(transaction => transaction.type === "withdrawal" && transaction.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = {
      id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      network: transaction.network || null,
      phoneNumber: transaction.phoneNumber || null,
      paymentName: transaction.paymentName || null,
      paymentReceipt: transaction.paymentReceipt || null,
      createdAt: new Date()
    };
    this.transactionsData.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactionsData.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, status };
    this.transactionsData.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async countTransactionsByUser(userId: number): Promise<number> {
    return Array.from(this.transactionsData.values())
      .filter(transaction => transaction.userId === userId)
      .length;
  }

  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = {
      id,
      userId: notification.userId,
      message: notification.message,
      isRead: false,
      createdAt: new Date()
    };
    this.notificationsData.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notificationsData.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notificationsData.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const userNotifications = Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId);
    
    for (const notification of userNotifications) {
      this.notificationsData.set(notification.id, { ...notification, isRead: true });
    }
  }

  // Referral methods
  async getReferralsByReferrer(referrerId: number): Promise<Referral[]> {
    return Array.from(this.referralsData.values()).filter(
      (referral) => referral.referrerId === referrerId
    );
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = this.referralId++;
    const newReferral: Referral = {
      id,
      referrerId: referral.referrerId,
      referredId: referral.referredId,
      createdAt: new Date()
    };
    this.referralsData.set(id, newReferral);
    return newReferral;
  }

  async getReferralCount(referrerId: number): Promise<number> {
    return (await this.getReferralsByReferrer(referrerId)).length;
  }

  async getReferralEarnings(referrerId: number): Promise<number> {
    return Array.from(this.transactionsData.values())
      .filter(transaction => transaction.userId === referrerId && transaction.type === "referral_bonus" && transaction.status === "completed")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }
}

export const storage = new MemStorage();
