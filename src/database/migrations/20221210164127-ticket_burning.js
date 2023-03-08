'use strict';

const GIFT_TABLE = 'gifts';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'users',
        'role',
        {
          type: Sequelize.ENUM,
          values: ['user', 'volunteer', 'admin'],
          defaultValue: 'user',
          allowNull: false,
        },
        {
          transaction,
        },
      );

      await queryInterface.bulkUpdate(
        'users',
        {
          role: 'user',
        },
        {
          role: {
            [Sequelize.Op.ne]: 'user',
          },
        },
        {
          transaction,
        },
      );

      await queryInterface.createTable(
        GIFT_TABLE,
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
          },
          giver_user_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          receiver_user_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          ticket_id: {
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
            values: ['offered', 'accepted', 'rejected', 'withdrawn'],
            defaultValue: 'offered',
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
      await queryInterface.dropTable(GIFT_TABLE, { transaction });
      await queryInterface.removeColumn('users', 'role', { transaction });
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },
};
