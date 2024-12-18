const { Sequelize } = require('sequelize');
const sequelize = require('../db/config');
const Truck = require('./Truck');
const Driver = require('./Driver');

const Delivery = sequelize.define('delivery', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    destination: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    value: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    valuableIndicator: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    haveInsurance: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
    },
    dangerous: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
    },
    rate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    truckId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'truck',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    driverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'driver', 
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    status: {
        type: Sequelize.ENUM('Em andamento', 'Concluida'),
        allowNull: false,
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    tableName: 'delivery',
    timestamps: true,
});

Delivery.belongsTo(Truck, { foreignKey: 'truckId', onDelete: 'CASCADE' });
Truck.hasOne(Delivery, { foreignKey: 'truckId', as: 'deliveries' });

Delivery.belongsTo(Driver, { foreignKey: 'driverId', onDelete: 'CASCADE' });
Driver.hasMany(Delivery, { foreignKey: 'driverId', as: 'deliveries' }); 


Delivery.sync({ alter: true, force: false }).then(() => {
    console.log("Tabela 'Delivery' foi sincronizada com o banco de dados");
}).catch(err => {
    console.error("Erro ao sincronizar a tabela 'Delivery':", err);
});

module.exports = Delivery;