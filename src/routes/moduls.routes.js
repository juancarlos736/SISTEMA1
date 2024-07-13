const { Router } = require("express");
const router = Router();

const {
  renderInicio
} = require("../controllers/moduls.controller");

const { isAuthenticated} = require("../helpers/auth");


router.get("/modulos", isAuthenticated, renderInicio);

module.exports = router;
