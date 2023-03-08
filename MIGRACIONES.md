# Como hacer migraciones

Documentacion: https://sequelize.org/docs/v6/other-topics/migrations/

Comando: `yarn sequelize-cli migration:generate --name NOMBRE_DE_LA_MIGRACION`

Ese comando genera un archivo base en `src/database/migrations`. 
El archivo se rellena con comandos para modificar la base de datos, por ejemplo los de acá:
- https://sequelize.org/docs/v6/other-topics/migrations/#migration-skeleton

Si quisiéramos cambiar el nombre de una columna, deberiamos hacer algo como esto
```JS

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameColumn('users', 'github_id', 'provider_id');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    await transaction.commit();
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameColumn('users', 'provider_id', 'github_id');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    await transaction.commit();
  },
};
```

Para correr una migración, hay que tener las variables de entorno, conectarse a la BDD y correr.

- `yarn sequelize-cli db:migrate`

Para setear en la bdd, que la tabla de migraciones tenga timestamps

- `yarn sequelize-cli db:migrate:schema:timestamps:add`

Para deshacer una migraci´øn
- `yarn sequelize-cli db:migrate:undo`

