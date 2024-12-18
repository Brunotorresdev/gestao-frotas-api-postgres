const express = require("express");
const dotenv = require("dotenv");
const routes = require("./src/routes");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

dotenv.config();

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use(routes);
app.get("/", (req, res) => res.json({ message: "Hello world!" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running in http://localhost:${port}`);
  });
}
