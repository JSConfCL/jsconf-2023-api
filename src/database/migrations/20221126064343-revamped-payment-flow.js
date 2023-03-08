'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // PAYMENT_TICKETS
      await queryInterface.dropTable('payment_tickets', { transaction });
      // PAYMENTS
      await queryInterface.removeColumn('payments', 'amount', { transaction });
      // TICKETS

      await queryInterface.removeColumn('tickets', 'price_usd', {
        transaction,
      });
      // USER_TICKETS
      await queryInterface.removeColumn('user_tickets', 'buyer_id', {
        transaction,
      });
      await queryInterface.removeColumn('user_tickets', 'attendee_id', {
        transaction,
      });
      await queryInterface.removeColumn('user_tickets', 'name', {
        transaction,
      });
      await queryInterface.removeColumn('user_tickets', 'email', {
        transaction,
      });
      await queryInterface.addColumn(
        'user_tickets',
        'payment_id',
        {
          type: Sequelize.STRING,
          references: {
            model: 'payments',
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'user_tickets',
        'ticket_id',
        {
          type: Sequelize.STRING,
          references: {
            model: 'tickets',
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'user_tickets',
        'status',
        {
          type: Sequelize.ENUM,
          values: [
            'created',
            'not_paid',
            'failed',
            'eliminated',
            'reserved',
            'not_redeemed',
            'offered',
            'redeemed',
          ],
          defaultValue: 'created',
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.addIndex('user_tickets', ['status'], {
        transaction,
      });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // REAGREGANDO COLUMNAS

      // PAYMENT_TICKETS
      await queryInterface.createTable(
        'payment_tickets',
        {
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
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );

      // PAYMENTS
      await queryInterface.addColumn(
        'payments',
        'amount',
        {
          type: Sequelize.INTEGER,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'tickets',
        'price_usd',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );

      // USER_TICKETS
      await queryInterface.addColumn(
        'user_tickets',
        'buyer_id',
        {
          type: Sequelize.STRING,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'user_tickets',
        'attendee_id',
        {
          type: Sequelize.STRING,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'user_tickets',
        'name',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'user_tickets',
        'email',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.removeColumn('user_tickets', 'payment_id', {
        transaction,
      });
      await queryInterface.removeColumn('user_tickets', 'ticket_id', {
        transaction,
      });
      await queryInterface.removeIndex('user_tickets', 'status', {
        transaction,
      });
      await queryInterface.removeColumn('user_tickets', 'status', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'drop type IF EXISTS enum_user_tickets_status;',
        { transaction },
      );
      await transaction.commit();
    } catch (e) {
      console.error(e);
      console.error('ROLLING BACK');
      await transaction.rollback();
      console.error('ROLLBACK DONE');
    }
  },
};
