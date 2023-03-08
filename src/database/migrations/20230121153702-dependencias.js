'use strict';

const TABLA_DE_DEPENDENCIAS = 'ticket_dependencies';
const TABLA_DE_TICKETS = 'tickets';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // rename the enum
      await queryInterface.sequelize.query(
        `ALTER TYPE enum_tickets_type RENAME TO enum_tickets_type_old;`,
        { transaction },
      );

      // create the new one
      await queryInterface.sequelize.query(
        `CREATE TYPE enum_tickets_type AS ENUM ('adult', 'student', 'gift', 'workshop', 'meetup');`,
        { transaction },
      );

      // change the column to use the new one, mapping data
      await queryInterface.sequelize.query(
        `
        ALTER TABLE  TICKETS
          ALTER COLUMN type TYPE enum_tickets_type USING (
            CASE
              WHEN type='adult' THEN 'adult'::text
              WHEN type='student' THEN 'student'::text
              WHEN type='gift' THEN 'gift'::text
              ELSE 'gift'::text
            END
          )::enum_tickets_type;
      `,
        { transaction },
      );

      // drop the old enum
      await queryInterface.sequelize.query(`DROP TYPE enum_tickets_type_old;`, {
        transaction,
      });

      await queryInterface.bulkInsert(
        TABLA_DE_TICKETS,
        [
          {
            id: 'tik_kdnm21mc08929cmal18hadkjo87dyh',
            stripe_price_id: null,
            name: 'Meetup JSConf',
            description: 'Meetup JSConf',
            type: 'meetup',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 70,
            price: 0,
            price_usd: 0,
          },
          {
            id: 'tik_lm9123879sndfkl0s809dfuhjnjvjk',
            stripe_price_id: null,
            name: 'Meet-&-drink',
            description: 'Meet and drink con Google',
            type: 'meetup',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 120,
            price: 0,
            price_usd: 0,
          },
          {
            id: 'tik_nnd7fah0971823ygbfhsdifds08u89',
            stripe_price_id: null,
            name: 'Workshop de Tamas',
            description: '',
            type: 'workshop',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 45,
            price: 0,
            price_usd: 0,
          },
          {
            id: 'tik_010fsgdsdf5g91majasdk823nmsdfd',
            stripe_price_id: null,
            name: 'Workshop de Julian',
            description: '',
            type: 'workshop',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 45,
            price: 0,
            price_usd: 0,
          },
          {
            id: 'tik_msalkdjnqweklniv698g132bihsdif',
            stripe_price_id: null,
            name: 'Workshop de Elastic',
            description: '',
            type: 'workshop',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 45,
            price: 0,
            price_usd: 0,
          },
          {
            id: 'tik_1293uhfdsna9s7hhoifaihsdfh9871',
            stripe_price_id: null,
            name: 'Workshop de Walmart',
            description: '',
            type: 'workshop',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 45,
            price: 0,
            price_usd: 0,
          },
          {
            id: 'tik_2u83hfsankjhbvdldvnkjdslfkgjnd',
            stripe_price_id: null,
            name: 'Workshop de Mediastream',
            description: '',
            type: 'workshop',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 45,
            price: 0,
            price_usd: 0,
          },
        ],
        {
          transaction,
        },
      );

      await queryInterface.createTable(
        TABLA_DE_DEPENDENCIAS,
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true,
          },
          ticket_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: TABLA_DE_TICKETS,
              key: 'id',
            },
          },
          requirement_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: TABLA_DE_TICKETS,
              key: 'id',
            },
          },
          created_at: {
            type: Sequelize.DataTypes.DATE,
            field: 'created_at',
            defaultValue: Sequelize.fn('now'),
          },
          updated_at: {
            type: Sequelize.DataTypes.DATE,
            field: 'updated_at',
            defaultValue: Sequelize.fn('now'),
          },
        },
        {
          transaction,
        },
      );

      if (process.env.APP_ENV == 'production') {
        const conferenceTicketsIds = [
          'tik_4RC2rPDEmxkfVexxXQKYjD6A',
          'tik_1LnuZ5GznLxpSYurJ1j1SzsG',
          'tik_jxCDMMeq2ew7f8y7ECKA2mtT',
          'tik_15wga3GznNxsGYnls9Sjklad9',
          'tik_1LnuZsGznLxpSYurHCV9c2ZG',
        ];

        const createdTicketIds = [
          'tik_kdnm21mc08929cmal18hadkjo87dyh',
          'tik_lm9123879sndfkl0s809dfuhjnjvjk',
          'tik_nnd7fah0971823ygbfhsdifds08u89',
          'tik_010fsgdsdf5g91majasdk823nmsdfd',
          'tik_msalkdjnqweklniv698g132bihsdif',
          'tik_1293uhfdsna9s7hhoifaihsdfh9871',
          'tik_2u83hfsankjhbvdldvnkjdslfkgjnd',
        ];

        const ticketMap = createdTicketIds
          .map((createdTicket) => {
            return conferenceTicketsIds.map((conferenceTicket) => {
              return {
                ticket_id: createdTicket,
                requirement_id: conferenceTicket,
              };
            });
          })
          .flat(1000);

        await queryInterface.bulkInsert(TABLA_DE_DEPENDENCIAS, ticketMap, {
          transaction,
        });
      }

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `delete from ${TABLA_DE_DEPENDENCIAS};`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `delete from tickets where id in (
          'tik_kdnm21mc08929cmal18hadkjo87dyh',
          'tik_lm9123879sndfkl0s809dfuhjnjvjk',
          'tik_nnd7fah0971823ygbfhsdifds08u89',
          'tik_010fsgdsdf5g91majasdk823nmsdfd',
          'tik_msalkdjnqweklniv698g132bihsdif',
          'tik_1293uhfdsna9s7hhoifaihsdfh9871',
          'tik_2u83hfsankjhbvdldvnkjdslfkgjnd'
        );
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `ALTER TYPE enum_tickets_type RENAME TO enum_tickets_type_old;`,
        { transaction },
      );

      // create the new one
      await queryInterface.sequelize.query(
        `CREATE TYPE enum_tickets_type AS ENUM ('adult', 'student', 'gift');`,
        { transaction },
      );

      // change the column to use the new one, mapping data
      await queryInterface.sequelize.query(
        `ALTER TABLE tickets
               ALTER COLUMN type DROP DEFAULT,
               ALTER COLUMN type TYPE enum_tickets_type
                 USING (CASE
                   WHEN type='adult' THEN 'adult'::text
                   WHEN type='student' THEN 'student'::text
                   WHEN type='gift' THEN 'gift'::text
                   ELSE 'gift'::text
                 END)::enum_tickets_type;
          `,
        { transaction },
      );

      // drop the old enum
      await queryInterface.sequelize.query(`DROP TYPE enum_tickets_type_old;`, {
        transaction,
      });

      await queryInterface.dropTable(TABLA_DE_DEPENDENCIAS, {
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
