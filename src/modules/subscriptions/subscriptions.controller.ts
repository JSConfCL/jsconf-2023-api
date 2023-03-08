import { Body, Controller, Post } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { VolunteerSubscriptionDTO } from './requests/dto/VolunteerSubscription.dto';
import { UserSubscriptionDTO } from './requests/dto/UserSubscription.dto';
import { SubscriptionsService } from './subscriptions.service';
import { MailgunService } from '../../services/mailgun.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private mailgunService: MailgunService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(SubscriptionsController.name);
  }
  @Post('/volunteer')
  async addVolunteer(@Body() body: VolunteerSubscriptionDTO) {
    this.logger.assign(body);
    this.logger.info('Creating volunteer');
    try {
      this.subscriptionsService.createVolunteerSubscription(body);
      this.logger.info('Volunteer created');
      return {};
    } catch (e) {
      this.logger.error('Volunteer could not be created');
      throw e;
    }
  }

  @Post('/')
  async subscribeToJSConf(@Body() body: UserSubscriptionDTO) {
    await this.mailgunService.addToMailingList(body.email, body.name);
    return {};
  }
}
