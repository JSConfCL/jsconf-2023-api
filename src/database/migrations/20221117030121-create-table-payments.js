'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      gateway: {
        type: Sequelize.ENUM,
        values: ['mercadopago', 'stripe'],
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['in_process', 'approved', 'cancelled', 'rejected'],
        defaultValue: 'in_process',
        allowNull: false,
      },
      currency: {
        type: Sequelize.ENUM,
        values: ['clp', 'usd'],
        allowNull: false,
      },
      reference_gateway_id: {
        type: Sequelize.STRING,
      },
      amount: {
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
    await queryInterface.dropTable('payments');
  },
};
