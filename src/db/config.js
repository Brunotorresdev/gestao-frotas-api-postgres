const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
let sequelize;
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: require('pg'),
    logging: false,
  });

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database was established successfully.");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
})();

module.exports = sequelize;
