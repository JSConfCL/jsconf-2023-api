'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'tickets',
        'price_usd',
        {
          type: Sequelize.FLOAT,
        },
        {
          transaction,
        },
      );
      await queryInterface.addColumn(
        'payments',
        'validated_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
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
      await queryInterface.removeColumn('tickets', 'price_usd', {
        transaction,
      });
      await queryInterface.removeColumn('payments', 'validated_at', {
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },
};
