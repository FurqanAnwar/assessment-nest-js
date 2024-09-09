import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    lastActivity: Date;
  }
}

declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>;
  }
}
