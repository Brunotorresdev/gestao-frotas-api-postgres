const { Sequelize } = require('sequelize');
const sequelize = require('../db/config');

const Driver = sequelize.define('driver', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    tableName: 'driver',
    timestamps: true,
});

Driver.sync({ alter: true, force: false }).then(() => {
    console.log("Tabela 'Driver' foi sincronizada com o banco de dados");
}).catch(err => {
    console.error("Erro ao sincronizar a tabela 'Driver':", err);
});

module.exports = Driver;
