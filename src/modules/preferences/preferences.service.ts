import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  PREFERENCES_REPOSITORY,
  USERS_PREFERENCES_REPOSITORY,
  USER_TICKETS_PREFERENCES_REPOSITORY,
} from 'src/core/constants';
import { UsersPreferences } from './entities/userPreference.entity';
import { Preference } from './entities/preferences.entity';
import { UserTicketPreference } from './entities/userTicketPreference.entity';
import { Optional } from 'sequelize';
import { NullishPropertiesOf } from 'sequelize/types/utils';

@Injectable()
export class PreferencesService {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(USER_TICKETS_PREFERENCES_REPOSITORY)
    private readonly userTicketPreferencesRepository: typeof UserTicketPreference,
    @Inject(PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: typeof Preference,
    @Inject(USERS_PREFERENCES_REPOSITORY)
    private readonly usersPreferencesRepository: typeof UsersPreferences,
  ) {
    this.logger.setContext(PreferencesService.name);
  }

  async upsertUserPreference(
    preferences: {
      foodPreference?: string;
      shirtSize?: string;
      shirtStyle?: string;
      foodAllergy?: string;
      pronouns?: string;
    },
    userId: string,
  ): Promise<void> {
    this.logger.assign({ preferences, userId });
    this.logger.info(`Attempting to update or create user preferences`);
    const newPreferences = [
      {
        preferenceId: 'foodPreference',
        preferenceValue: preferences.foodPreference,
        userId,
      },
      {
        preferenceId: 'shirtSize',
        preferenceValue: preferences.shirtSize,
        userId,
      },
      {
        preferenceId: 'shirtStyle',
        preferenceValue: preferences.shirtStyle,
        userId,
      },
      {
        preferenceId: 'foodAllergy',
        preferenceValue: preferences.foodAllergy,
        userId,
      },
      {
        preferenceId: 'pronouns',
        preferenceValue: preferences.pronouns,
        userId,
      },
    ].filter((preference) => Boolean(preference.preferenceValue)) as Optional<
      UsersPreferences,
      NullishPropertiesOf<UsersPreferences>
    >[];

    await this.usersPreferencesRepository.bulkCreate(newPreferences, {
      updateOnDuplicate: ['preferenceValue'],
      returning: true,
    });
  }

  async upsertUserTicketPreference(
    preferences: {
      foodPreference?: string;
      shirtSize?: string;
      shirtStyle?: string;
      foodAllergy?: string;
      pronouns?: string;
    },
    userTicketId: string,
  ) {
    this.logger.assign({ preferences, userTicketId });
    this.logger.info(`Attempting to update or create user preferences`);
    const newPreferences = [
      {
        preferenceId: 'foodPreference',
        preferenceValue: preferences.foodPreference,
        userTicketId,
      },
      {
        preferenceId: 'shirtSize',
        preferenceValue: preferences.shirtSize,
        userTicketId,
      },
      {
        preferenceId: 'shirtStyle',
        preferenceValue: preferences.shirtStyle,
        userTicketId,
      },
      {
        preferenceId: 'foodAllergy',
        preferenceValue: preferences.foodAllergy,
        userTicketId,
      },
      {
        preferenceId: 'pronouns',
        preferenceValue: preferences.pronouns,
        userTicketId,
      },
    ].filter((preference) => Boolean(preference.preferenceValue)) as Optional<
      UserTicketPreference,
      NullishPropertiesOf<UserTicketPreference>
    >[];
    await this.userTicketPreferencesRepository.bulkCreate(newPreferences, {
      updateOnDuplicate: ['preferenceValue'],
      returning: true,
    });
  }

  async findUserPreference(userId: string) {
    this.logger.assign({ userId });
    this.logger.info('Finding user preferences');

    const userPreferences = await this.usersPreferencesRepository.findAll({
      where: {
        userId,
      },
      include: Preference,
    });
    const preferences = this.parsePreferences(userPreferences);
    this.logger.info('Returning user preferences');
    return preferences;
  }

  private async findUserTicketPreference(userTicketId: string) {
    const result = await this.userTicketPreferencesRepository.findAndCountAll({
      where: {
        userTicketId,
      },
      include: Preference,
    });
    return result;
  }

  async getUserTicketPreference(userTicketId: string, userId: string) {
    this.logger.assign({ userTicketId });
    this.logger.info(
      `Finding a preference for userTicket with ID: ${userTicketId}`,
    );
    let results = await this.findUserTicketPreference(userTicketId);
    if (results.count === 0) {
      this.logger.info('No preferences for the User Ticket, creating them');
      const userPreferences = await this.findUserPreference(userId);
      await this.upsertUserTicketPreference(userPreferences, userTicketId);
      results = await this.findUserTicketPreference(userTicketId);
    }
    const preferences = this.parsePreferences(results.rows);
    this.logger.info('Returning userticket preferences');
    return preferences;
  }

  private parsePreferences = (
    listOfPreferences: UserTicketPreference[] | UsersPreferences[],
  ) => {
    const preferences = {
      foodPreference: '',
      shirtSize: '',
      shirtStyle: '',
      foodAllergy: '',
      pronouns: '',
    };
    listOfPreferences.forEach((preference) => {
      preferences[preference.preferenceId as keyof typeof preferences] =
        preference.preferenceValue;
    });
    return preferences;
  };

  deleteUserPreference(id: string) {
    return `This action returns a #${id} preference`;
  }

  deleteTicketPreference(id: string) {
    return `This action returns a #${id} preference`;
  }
}
