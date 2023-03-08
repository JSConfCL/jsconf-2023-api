'use strict';

const REDEMPTION_TYPES_TABLE = 'redemption_types';
const REDEMPTIONS_TICKETS_TABLE = 'redemption_types_tickets';
const TICKETS = 'tickets';
const REDEMPTIONS_TABLE = 'redemptions';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        REDEMPTIONS_TICKETS_TABLE,
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
              model: TICKETS,
              key: 'id',
            },
          },
          redemption_type_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: REDEMPTION_TYPES_TABLE,
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

      await queryInterface.removeColumn(
        REDEMPTIONS_TABLE,
        'redemption_type_id',
        {
          transaction,
        },
      );
      await queryInterface.addColumn(
        REDEMPTIONS_TABLE,
        'redemption_types_tickets_id',
        {
          type: Sequelize.UUID,
          references: {
            model: REDEMPTIONS_TICKETS_TABLE,
            key: 'id',
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        REDEMPTION_TYPES_TABLE,
        {
          id: {
            [Sequelize.Op.in]: [
              '62fcffeb-64e0-4c01-ac28-705fc9f428be',
              '083fbbb9-acfb-4791-bf80-46acd8e13db2',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkInsert(
        REDEMPTION_TYPES_TABLE,
        [
          {
            id: 'cf8e2cf0-8f8e-464c-878f-4cb7305bc0b7',
            name: 'General Access',
            description:
              'Redempción para asignar a tickets que tienen solo 1 control de acceso',
          },
        ],
        { transaction },
      );

      // Agregando redemptions_types_tickets
      const listOfRedepmtionsToAddToConferenceTickets = [
        'dacb8d84-91c1-4dd5-a9d5-8b484613cf2d',
        'db357539-ab31-4cc7-bd30-ba2fe5705f0f',
        '3b7657ec-2686-499f-bbde-2cc4efa22aa5',
        'dea88c2f-ba71-4312-94b1-e064347440f8',
        'feadd5b2-0608-4b20-81b1-d754cd4db0e5',
      ];
      const conferenceTicketIds = [
        'tik_4RC2rPDEmxkfVexxXQKYjD6A',
        'tik_1LnuZ5GznLxpSYurJ1j1SzsG',
        'tik_jxCDMMeq2ew7f8y7ECKA2mtT',
        'tik_15wga3GznNxsGYnls9Sjklad9',
        'tik_1LnuZsGznLxpSYurHCV9c2ZG',
      ];

      const redemptionToAddToMeetupAndWorkshops = [
        'cf8e2cf0-8f8e-464c-878f-4cb7305bc0b7',
      ];
      const ticketIdsThatRequireSingleRedemption = [
        'tik_lm9123879sndfkl0s809dfuhjnjvjk',
        'tik_nnd7fah0971823ygbfhsdifds08u89',
        'tik_010fsgdsdf5g91majasdk823nmsdfd',
        'tik_msalkdjnqweklniv698g132bihsdif',
        'tik_1293uhfdsna9s7hhoifaihsdfh9871',
        'tik_2u83hfsankjhbvdldvnkjdslfkgjnd',
        'tik_kdnm21mc08929cmal18hadkjo87dyh',
      ];

      const conferenceTicketRedemptions =
        listOfRedepmtionsToAddToConferenceTickets
          .map((redemption_type_id) => {
            return conferenceTicketIds.map((ticket_id) => {
              return {
                ticket_id,
                redemption_type_id,
              };
            });
          })
          .flat(100);
      await queryInterface.bulkInsert(
        REDEMPTIONS_TICKETS_TABLE,
        conferenceTicketRedemptions,
        {
          transaction,
        },
      );

      const singleRedemptionTickets = redemptionToAddToMeetupAndWorkshops
        .map((redemption_type_id) => {
          return ticketIdsThatRequireSingleRedemption.map((ticket_id) => {
            return {
              ticket_id,
              redemption_type_id,
            };
          });
        })
        .flat(100);
      await queryInterface.bulkInsert(
        REDEMPTIONS_TICKETS_TABLE,
        singleRedemptionTickets,
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw new Error(e);
    }
  },

  async down(queryInterface, Sequelize) {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        REDEMPTIONS_TABLE,
        'redemption_types_tickets_id',
        {
          transaction,
        },
      );
      await queryInterface.addColumn(
        REDEMPTIONS_TABLE,
        'redemption_type_id',
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: REDEMPTION_TYPES_TABLE,
            key: 'id',
          },
        },
        {
          transaction,
        },
      );

      await queryInterface.bulkDelete(
        REDEMPTION_TYPES_TABLE,
        { id: 'cf8e2cf0-8f8e-464c-878f-4cb7305bc0b7' },
        { transaction },
      );

      await queryInterface.bulkInsert(
        REDEMPTION_TYPES_TABLE,
        [
          {
            id: '62fcffeb-64e0-4c01-ac28-705fc9f428be',
            name: 'Workshop 1',
            description: 'Acreditación del primer workshop',
          },
          {
            id: '083fbbb9-acfb-4791-bf80-46acd8e13db2',
            name: 'Workshop 2',
            description: 'Acreditación del segundo workshop',
          },
        ],
        {
          transaction,
        },
      );

      await queryInterface.dropTable(REDEMPTIONS_TICKETS_TABLE, {
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw new Error(e);
    }
  },
};
