import 'express';

declare module 'express' {
  export interface Request {
    cookies: Record<string, any>;
    res: Record<string, any>;
    sessionStore: any;
    session: any;
    sessionID: string; 
  }

  export interface Response {
    json: (body?: any) => Response;
    cookie: (name?: any, value?: any, options?: any) => Request;
  }
}