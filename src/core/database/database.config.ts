import * as dotenv from 'dotenv';
import { SequelizeOptions } from 'sequelize-typescript';
import { Logger } from '@nestjs/common';

dotenv.config();
const logger = new Logger('DatabaseProviders');

export const databaseConfig: SequelizeOptions = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  dialect: 'postgres',
  benchmark: true,
  logging: (props) => {
    logger.localInstance;
    if (typeof props === 'string') {
      logger.log('SEQUELIZE', {
        message: `executed SQL query`,
        query: props,
      });
    } else {
      logger.log('SEQUELIZE', {
        message: `executed SQL query`,
        query: props[0],
        duration: props[1],
        ...((props[2] as unknown as object) || {}),
      });
    }
  },
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};
