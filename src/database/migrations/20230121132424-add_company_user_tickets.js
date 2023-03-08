'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'user_tickets',
        'company',
        {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
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
      await queryInterface.removeColumn('user_tickets', 'company', {
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },
};
