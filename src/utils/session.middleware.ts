import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as session from 'express-session';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { extendDefaultFields } from './extendDefaultFieldsForSession';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const SequelizeStore = require('connect-session-sequelize')(session.Store);

    const store = new SequelizeStore({
      db: this.sequelize,
      table: "Sessions",
      extendDefaultFields: extendDefaultFields,
    });
  
    await store.sync();

    session({
      secret: process.env.COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        httpOnly: true,
        sameSite: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      store,
    })(req, res, next);
  }
}