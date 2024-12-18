const { Sequelize } = require('sequelize');
const sequelize = require('../db/config');

const Truck = sequelize.define('truck', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    plate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'truck',
    timestamps: true,
});

Truck.sync({ alter: true, force: false }).then(() => {
    console.log("Tabela 'truck' foi sincronizada com o banco de dados");
}).catch(err => {
    console.error("Erro ao sincronizar a tabela 'truck':", err);
});

module.exports = Truck;
