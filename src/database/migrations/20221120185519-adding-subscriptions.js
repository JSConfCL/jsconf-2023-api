'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('subscriptions', {
        id: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        email: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.DataTypes.STRING,
        },
        lastName: {
          type: Sequelize.DataTypes.STRING,
        },
        why: {
          type: Sequelize.DataTypes.STRING,
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
      });
      t.commit();
    } catch (e) {
      console.error(e);
      t.rollback();
    }
  },

  async down(queryInterface) {
    return queryInterface.dropTable('subscriptions');
  },
};
