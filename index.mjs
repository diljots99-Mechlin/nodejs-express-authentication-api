// express
import express from "express";
import bodyParser from "body-parser";

//swagger
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

//routes
import usersRoutes from "./routes/auth.mjs";

import db from "./models/index.cjs";
import dotenv from "dotenv";

dotenv.config();

const { sequelize, Sequelize } = db;

const app = express();
const HOST = "localhost";
const PORT = process.env.PORT || 443;
app.use(bodyParser.json());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "General Authentication API",
      version: "0.1.0",
      description:
        "This is a simple API application made with Express, NodeJS and documented with Swagger",
    },
    servers: [
      {
        url: `/`,
      },
    ],
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    // security: [
    //   {
    //     jwt: [],
    //   },
    // ],
  },

  apis: ["./routes/*.js", "./routes/*.mjs", "./routes/*.cjs"],
};

const specs = swaggerJsdoc(options);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/test", (req, res) => {
  console.log("baseUrls", req.url);
  // req.url = "/swagger";
  res.redirect(301, "/swagger");
});

app.use("/emailAuthentication/", usersRoutes);

db.sequelize
  .sync({
    alter: true,
  })
  .then((result) => {
    // console.log(result);
    app.listen(PORT, () =>
      console.log(`Server Running on port: http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    // console.log(err);
  });
