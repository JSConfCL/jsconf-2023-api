'use strict';

const USERS = 'users';
const PREFERENCES = 'preferences';
const USER_TICKETS = 'user_tickets';
const USER_PREFERENCES = 'users_preferences';
const USER_TICKETS_PREFERENCES = 'user_tickets_preferences';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        PREFERENCES,
        {
          id: {
            type: Sequelize.STRING,
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
          possible_values: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [],
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

      await queryInterface.createTable(
        USER_TICKETS_PREFERENCES,
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
              model: USER_TICKETS,
              key: 'id',
            },
          },
          preference_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: PREFERENCES,
              key: 'id',
            },
          },
          preference_value: {
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
      await queryInterface.createTable(
        USER_PREFERENCES,
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            allowNull: false,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: USERS,
              key: 'id',
            },
          },
          preference_id: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
              model: PREFERENCES,
              key: 'id',
            },
          },
          preference_value: {
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
      await transaction.commit();

      queryInterface.bulkInsert(PREFERENCES, [
        {
          id: 'foodPreference',
          name: 'Preferencia Alimentaria',
          description: '',
          possible_values: ['Vegetariana', 'Vegana', 'Ninguna'],
        },
        {
          id: 'shirtSize',
          name: 'Tamaño de Polera',
          description: '',
          possible_values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        },
        {
          id: 'shirtStyle',
          name: 'Estilo de Polera',
          description: '',
          possible_values: ['Corte ajustado', 'Corte clásico'],
        },
        {
          id: 'foodAllergy',
          name: 'Alergias Alimentarias',
          description: '',
          possible_values: [
            'Nueces (Maní, Almendras, etc)',
            'Crustaceos Marinos',
          ],
        },
        {
          id: 'pronouns',
          name: 'Pronombres',
          description: '',
          possible_values: ['El', 'Ella', 'Elle'],
        },
      ]);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable(USER_TICKETS_PREFERENCES);
      await queryInterface.dropTable(USER_PREFERENCES);
      await queryInterface.dropTable(PREFERENCES);
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
};
