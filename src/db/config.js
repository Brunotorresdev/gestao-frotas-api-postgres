const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
let sequelize;
if (process.env.STAGE === "dev") {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
    }
  );
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database was established successfully.");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
})();

module.exports = sequelize;
