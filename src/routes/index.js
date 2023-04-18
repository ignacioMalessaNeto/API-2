const { Router } = require("express");

const usersRoutes = require("./user.routes");
const notesRoutes = require("./notes.routes");
const tagsRoutes = require("./tags.routes");

const routes = Router();
routes.use("/users", usersRoutes);
routes.use("/movies_notes", notesRoutes);
routes.use("/tags",tagsRoutes);

module.exports = routes;