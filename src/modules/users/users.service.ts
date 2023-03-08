import { Injectable, Inject } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { Op } from 'sequelize';

import { User } from './user.entity';
import { UserTicket } from './userTicket.entity';
import { Ticket } from '../tickets/ticket.entity';

import { UpdateUserDTO } from './requests/dto/update.dto';

import { UserCreationDTO } from './user.dto';
import { MailgunService } from '../../services/mailgun.service';

import { USER_REPOSITORY, USER_TICKET_REPOSITORY } from '../../core/constants';
import { PreferencesService } from '../preferences/preferences.service';
import { UsersPreferences } from '../preferences/entities/userPreference.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: PinoLogger,
    private mailgunService: MailgunService,
    @Inject(USER_REPOSITORY) private readonly userRepository: typeof User,
    @Inject(USER_TICKET_REPOSITORY)
    private readonly userTicketRepository: typeof UserTicket,
    private preferencesService: PreferencesService,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(user: UserCreationDTO) {
    this.logger.info(`attempting to create user`);
    try {
      const userToCreate = new User();
      userToCreate.id = `usr_${nanoid()}`;
      userToCreate.name = user.name;
      userToCreate.email = user.email;
      userToCreate.password = user.password;
      userToCreate.photo = user.photo;
      userToCreate.provider = user.provider;
      userToCreate.providerId = user.providerId;
      userToCreate.username = user.username;
      const userCreated = await userToCreate.save();
      this.logger.info(`user created`);

      this.logger.info(`trying to send email to user`);

      try {
        if (userCreated.email) {
          await this.mailgunService.addToMailingList(
            userCreated.email,
            userCreated.name,
          );
          await this.mailgunService.sendEmail(
            'welcome',
            'WELCOME',
            user.email,
            {
              name: user.name,
            },
          );
        }
      } catch (e) {
        this.logger.error(`email communications failed`, e);
      }

      this.logger.info(`Email sent`);
      return userCreated;
    } catch (e) {
      this.logger.error('error creating user', e);
      throw e;
    }
  }

  async update(userId: string, user: UpdateUserDTO) {
    const {
      foodPreference,
      shirtSize,
      shirtStyle,
      foodAllergy,
      pronouns,
      name,
      username,
      country,
      company,
      email,
      position,
      seniority,
      yearsOfExperience,
      gender,
    } = user;
    const [numberOfUsersUpdated, updatedUsers] =
      await this.userRepository.update(
        {
          name,
          username,
          country,
          company,
          position,
          seniority,
          gender,
          email,
          yearsOfExperience,
        },
        {
          where: { id: userId },
          returning: true,
        },
      );

    await this.preferencesService.upsertUserPreference(
      {
        foodPreference,
        shirtSize,
        shirtStyle,
        foodAllergy,
        pronouns,
      },
      userId,
    );
    if (updatedUsers) {
      const [updatedUser] = updatedUsers;
      if (numberOfUsersUpdated === 0) {
        this.logger.info('No user information was udpated');
      } else if (updatedUser.email) {
        try {
          await this.mailgunService.updateUserOnMailingList(
            updatedUser.email,
            updatedUser.name,
          );
        } catch {}
      }

      return updatedUser;
    }

    return this.findFullUserById(userId);
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findOneById(id: string) {
    this.logger.assign({ userId: id });
    const data = await this.userRepository.findOne<User>({
      where: { id },
    });
    return data;
  }

  async findOneByUsername(username: string) {
    this.logger.assign({ username });
    const data = await this.userRepository.findOne<User>({
      where: { username },
    });
    return data;
  }

  async findFullUserById(userId: string) {
    const foundUser = await this.findOneById(userId);
    const userPreferences = await this.findUserPreferences(userId);
    return {
      company: foundUser?.company,
      country: foundUser?.country,
      email: foundUser?.email,
      gender: foundUser?.gender,
      id: foundUser?.id,
      name: foundUser?.name,
      photo: foundUser?.photo,
      position: foundUser?.position,
      provider: foundUser?.provider,
      providerId: foundUser?.providerId,
      role: foundUser?.role,
      seniority: foundUser?.seniority,
      username: foundUser?.username,
      yearsOfExperience: foundUser?.yearsOfExperience,
      foodPreference: userPreferences.foodPreference,
      shirtSize: userPreferences.shirtSize,
      shirtStyle: userPreferences.shirtStyle,
      foodAllergy: userPreferences.foodAllergy,
      pronouns: userPreferences.pronouns,
    };
  }

  async findUserPreferences(id: string) {
    const userPreferences = await this.preferencesService.findUserPreference(
      id,
    );
    return userPreferences;
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { providerId },
    });
  }

  public async activeTickets(userId: string): Promise<UserTicket[]> {
    const results = await this.userTicketRepository.findAll({
      where: {
        ownerId: userId,
        status: {
          [Op.in]: ['not_redeemed', 'redeemed', 'offered'],
        },
      },
      include: Ticket,
    });
    return results;
  }
}
