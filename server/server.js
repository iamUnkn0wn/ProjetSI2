const express = require("express");
require("express-async-errors");

const app = express();
const cors = require("cors");

app.use(cors({ origin: "*" }));

require("./startup/database")();
require("./startup/routes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
