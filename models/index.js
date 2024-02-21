const Sequelize = require('sequelize');
const dbConfig = require('../config/dbConfig.js');

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD, {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorsAliases: 0,
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importing models
db.kafka = require('./kafkaModel.js')(sequelize, Sequelize);

// Syncing models with the database
sequelize.sync({ force: false })
    .then(() => {
        console.log('Models synced with the database...');
    })
    .catch(error => {
        console.error('Error syncing models with the database:', error);
    });

module.exports = db;
