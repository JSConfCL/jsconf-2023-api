'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert(
        'tickets',
        [
          {
            id: 'tik_1LnuZ5GznLxpSYurJ1j1SzsG',
            name: 'Entrada JSCONF',
            description: 'Ticket Estudiante',
            stripe_price_id: 'price_1Lruk3IXoEqD5DJRPnaR1ds4',
            type: 'student',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 40,
            price: 25000,
            price_usd: 25,
          },
          {
            id: 'tik_1LnuZsGznLxpSYurHCV9c2ZG',
            name: 'Entrada JSCONF',
            description: 'Ticket Adulto',
            stripe_price_id: 'price_1LrukbIXoEqD5DJRmGzGn9H0',
            type: 'adult',
            season: 'early_bird',
            status: 'on_sale',
            quantity: 90,
            price: 70000,
            price_usd: 70,
          },
          {
            id: 'tik_UDI7rDSXKoqVi3qfBDddCQ5B',
            name: 'Entrada JSCONF',
            description: 'Ticket Estudiante',
            stripe_price_id: 'price_1LrumTIXoEqD5DJRsC0zbpfC',
            type: 'student',
            season: 'sale',
            status: 'soon',
            quantity: 50,
            price: 42000,
            price_usd: 42,
          },
          {
            id: 'tik_rCVkNJo2PPFyzyeXniCoXQyv',
            name: 'Entrada JSCONF',
            description: 'Ticket Adulto',
            stripe_price_id: 'price_1LrumjIXoEqD5DJRTy3aw6SE',
            type: 'adult',
            season: 'sale',
            status: 'soon',
            quantity: 220,
            price: 133700,
            price_usd: 133,
          },
        ],
        {
          transaction,
        },
      );

      await queryInterface.bulkInsert(
        'users',
        [
          {
            id: 'usr_TvjgsX0bHLmGfNth5c85E',
            name: 'Felipe Torres (fforres)',
            username: 'fforres',
            email: 'FELIPE.TORRESSEPULVEDA@GMAIL.COM',
            password: null,
            photo: 'https://avatars.githubusercontent.com/u/952992?v=4',
            country: null,
            company: null,
            position: null,
            seniority: null,
            years_of_experience: null,
            provider: 'github',
            provider_id: '952992',
            gender: null,
            created_at: '2022-11-28T00:19:21.156Z',
            updated_at: '2022-11-28T00:19:21.156Z',
          },
        ],
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
      await queryInterface.bulkDelete('tickets', { transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },
};
