'use strict';

const REDEMPTION_TYPES_TABLE = 'redemption_types';
const REDEMPTIONS_TABLE = 'redemptions';
const GIFT_TABLE = 'gifts';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
        {
          raw: true,
        },
      );
      await queryInterface.addColumn(
        GIFT_TABLE,
        'created_at',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
        {
          transaction,
        },
      );
      await queryInterface.addColumn(
        GIFT_TABLE,
        'updated_at',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: Sequelize.fn('now'),
        },
        {
          transaction,
        },
      );
      await queryInterface.createTable(
        REDEMPTION_TYPES_TABLE,
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          description: {
            type: Sequelize.STRING,
            allowNull: false,
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
        { transaction },
      );

      await queryInterface.bulkInsert(
        REDEMPTION_TYPES_TABLE,
        [
          {
            name: 'Almuerzo día 1',
            description: 'Almuerzo del primer día',
          },
          {
            name: 'Aalmuerzo día 2',
            description: 'Almuerzo para el segundo día',
          },
          {
            name: 'Acreditación día 1',
            description: 'Acreditación del primer día',
          },
          {
            name: 'Acreditación día 2',
            description: 'Acreditación para el segundo día',
          },
          {
            name: 'SWAG',
            description: 'Bolsita con regalos!!',
          },
          {
            name: 'Workshop 1',
            description: 'Acreditación del primer workshop',
          },
          {
            name: 'Workshop 2',
            description: 'Acreditación del segundo workshop',
          },
        ],
        {
          transaction,
        },
      );

      await queryInterface.createTable(
        REDEMPTIONS_TABLE,
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true,
          },
          user_ticket_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'user_tickets',
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
          redeemer_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['redeemed', 'not_redeemed'],
            defaultValue: 'redeemed',
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

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(GIFT_TABLE, 'created_at', {
        transaction,
      });
      await queryInterface.removeColumn(GIFT_TABLE, 'updated_at', {
        transaction,
      });
      await queryInterface.dropTable(REDEMPTIONS_TABLE, {
        transaction,
      });
      await queryInterface.dropTable(REDEMPTION_TYPES_TABLE, { transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },
};
