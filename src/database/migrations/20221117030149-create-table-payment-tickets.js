'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_tickets', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      payment_id: {
        type: Sequelize.STRING,
        references: {
          model: 'payments',
          key: 'id',
        },
      },
      ticket_id: {
        type: Sequelize.STRING,
        references: {
          model: 'tickets',
          key: 'id',
        },
      },
      quantity: {
        type: Sequelize.INTEGER,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_tickets');
  },
};
