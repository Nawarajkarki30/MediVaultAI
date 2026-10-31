import {
  prisma,
  User,
  Role,
  Session,
  VerificationToken,
  PasswordResetToken,
} from '@medivault/database';

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash: string;
  role?: Role;
  emailVerifiedAt?: Date | null;
}

export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface CreateTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  createSession(data: CreateSessionData): Promise<Session>;
  findSessionByTokenHash(tokenHash: string): Promise<(Session & { user: User }) | null>;
  updateSessionLastUsed(id: string): Promise<void>;
  revokeSession(id: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;

  createVerificationToken(data: CreateTokenData): Promise<VerificationToken>;
  findVerificationToken(tokenHash: string): Promise<(VerificationToken & { user: User }) | null>;
  markVerificationTokenUsed(id: string): Promise<void>;

  createPasswordResetToken(data: CreateTokenData): Promise<PasswordResetToken>;
  findPasswordResetToken(tokenHash: string): Promise<(PasswordResetToken & { user: User }) | null>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
}

/**
 * Prisma implementation of IAuthRepository.
 * Runs against PostgreSQL when the database server is running.
 */
export class PrismaAuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role || Role.PATIENT,
        emailVerifiedAt: data.emailVerifiedAt || null,
      },
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async createSession(data: CreateSessionData): Promise<Session> {
    return prisma.session.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findSessionByTokenHash(tokenHash: string): Promise<(Session & { user: User }) | null> {
    return prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async updateSessionLastUsed(id: string): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async revokeSession(id: string): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createVerificationToken(data: CreateTokenData): Promise<VerificationToken> {
    return prisma.verificationToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findVerificationToken(
    tokenHash: string
  ): Promise<(VerificationToken & { user: User }) | null> {
    return prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async markVerificationTokenUsed(id: string): Promise<void> {
    await prisma.verificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async createPasswordResetToken(data: CreateTokenData): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findPasswordResetToken(
    tokenHash: string
  ): Promise<(PasswordResetToken & { user: User }) | null> {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}

/**
 * In-Memory implementation of IAuthRepository.
 * Used for automated security test suites, integration tests, and standalone dev mode
 * when a local PostgreSQL database is not running.
 */
export class InMemoryAuthRepository implements IAuthRepository {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private verificationTokens: Map<string, VerificationToken> = new Map();
  private passwordResetTokens: Map<string, PasswordResetToken> = new Map();

  async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const user: User = {
      id,
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || Role.PATIENT,
      emailVerifiedAt: data.emailVerifiedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return { ...user };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    const updated: User = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return { ...updated };
  }

  async createSession(data: CreateSessionData): Promise<Session> {
    const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const session: Session = {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      revokedAt: null,
      createdAt: now,
      lastUsedAt: now,
    };
    this.sessions.set(id, session);
    return { ...session };
  }

  async findSessionByTokenHash(tokenHash: string): Promise<(Session & { user: User }) | null> {
    for (const session of this.sessions.values()) {
      if (session.tokenHash === tokenHash) {
        const user = this.users.get(session.userId);
        if (!user) return null;
        return { ...session, user: { ...user } };
      }
    }
    return null;
  }

  async updateSessionLastUsed(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.lastUsedAt = new Date();
    }
  }

  async revokeSession(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.revokedAt = new Date();
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = new Date();
      }
    }
  }

  async createVerificationToken(data: CreateTokenData): Promise<VerificationToken> {
    const id = `vtok-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const token: VerificationToken = {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.verificationTokens.set(id, token);
    return { ...token };
  }

  async findVerificationToken(
    tokenHash: string
  ): Promise<(VerificationToken & { user: User }) | null> {
    for (const token of this.verificationTokens.values()) {
      if (token.tokenHash === tokenHash) {
        const user = this.users.get(token.userId);
        if (!user) return null;
        return { ...token, user: { ...user } };
      }
    }
    return null;
  }

  async markVerificationTokenUsed(id: string): Promise<void> {
    const token = this.verificationTokens.get(id);
    if (token) {
      token.usedAt = new Date();
    }
  }

  async createPasswordResetToken(data: CreateTokenData): Promise<PasswordResetToken> {
    const id = `rtok-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const token: PasswordResetToken = {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.passwordResetTokens.set(id, token);
    return { ...token };
  }

  async findPasswordResetToken(
    tokenHash: string
  ): Promise<(PasswordResetToken & { user: User }) | null> {
    for (const token of this.passwordResetTokens.values()) {
      if (token.tokenHash === tokenHash) {
        const user = this.users.get(token.userId);
        if (!user) return null;
        return { ...token, user: { ...user } };
      }
    }
    return null;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    const token = this.passwordResetTokens.get(id);
    if (token) {
      token.usedAt = new Date();
    }
  }

  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.verificationTokens.clear();
    this.passwordResetTokens.clear();
  }
}

// Global active repository instance
let activeRepository: IAuthRepository = new InMemoryAuthRepository();

export function setAuthRepository(repo: IAuthRepository): void {
  activeRepository = repo;
}

export function getAuthRepository(): IAuthRepository {
  return activeRepository;
}
