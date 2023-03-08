import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { databaseConfig } from '../core/database/database.config';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUnique implements ValidatorConstraintInterface {
  private readonly logger = new Logger(IsUnique.name);
  constructor() {
    this.logger.log(`Validation ${IsUnique.name}`);
  }

  async validate(colmunValue: any, args: ValidationArguments) {
    const params = args.constraints[0];
    try {
      const sequelize = new Sequelize(databaseConfig);
      const [result]: any = await sequelize.query(
        `SELECT id FROM ${params.table} WHERE ${params.column} = '${colmunValue}'`,
        { nest: true },
      );

      await sequelize.close();
      if (result) {
        return false;
      }
      this.logger.error(
        `"${params.column}" Is not unique, an entry already exists for value "${colmunValue}"`,
      );
      return true;
    } catch (error) {
      this.logger.error('error validating uniqueness', error);
      return false;
    }
  }
}
