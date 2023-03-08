import { Injectable } from '@nestjs/common';
import FormData = require('form-data');
import Mailgun from 'mailgun.js';
import { CreateUpdateMailListMembers } from 'mailgun.js/interfaces/mailListMembers';
import { PinoLogger } from 'nestjs-pino';
import { SUBJECTS } from './constants/mailgunSubjects';

@Injectable()
export class MailgunService {
  private mgClient;
  private mailingList = 'notifications@mg.jsconf.cl';

  constructor(private readonly logger: PinoLogger) {
    const mailgun = new Mailgun(FormData);
    this.logger.setContext(MailgunService.name);
    this.mgClient = mailgun.client({
      username: process.env.MAILGUN_USERNAME,
      key: process.env.MAILGUN_PRIVATE_KEY,
      public_key: process.env.MAILGUN_PUBLIC_KEY,
    });
  }

  public async sendEmail(
    template: string,
    subjectType: keyof typeof SUBJECTS,
    to: string,
    params: object,
  ) {
    const mailgunData = {
      from: process.env.MAILGUN_FROM,
      to,
      subject: SUBJECTS[subjectType],
      template,
      'h:X-Mailgun-Variables': JSON.stringify(params),
    };
    this.logger.assign(mailgunData);
    this.logger.info(`trying to send email`);
    try {
      const response = await this.mgClient.messages.create(
        process.env.MAILGUN_DOMAIN,
        mailgunData,
      );
      this.logger.info(`email sent`);
      return response;
    } catch (error) {
      this.logger.error('could not send email', error);
      throw error;
    }
  }

  public async addToMailingList(email: string, name?: string) {
    this.logger.assign({ email, name });
    this.logger.info(`Adding user to mailing list`);
    const mailingListMemberData: CreateUpdateMailListMembers = {
      address: email,
      name: name,
      subscribed: true,
      upsert: 'yes',
    };
    try {
      const response = await this.mgClient.lists.members.createMember(
        this.mailingList,
        mailingListMemberData,
      );
      this.logger.info(`User added to mailing list`);
      return response;
    } catch (error) {
      this.logger.error('could not add user to mailing list', error);
      throw error;
    }
  }

  public async updateUserOnMailingList(email: string, name?: string) {
    this.logger.assign({ email, name });
    this.logger.info(`Updating user on mailing list`);
    const mailingListMemberData: CreateUpdateMailListMembers = {
      address: email,
      name: name,
      subscribed: true,
      upsert: 'yes',
    };
    try {
      const response = await this.mgClient.lists.members.updateMember(
        this.mailingList,
        email,
        mailingListMemberData,
      );
      this.logger.info('User updated on mailing list');
      return response;
    } catch (error) {
      this.logger.error('Could not update user on mailing list', error);
      throw error;
    }
  }
}
