const { Router } = require("express");
const router = Router();

const { renderFormulas, renderagregarformula, agregarformula, rendercrearproducto, crearproducto } = require("../controllers/formulas.controller");

const { isAuthenticated} = require("../helpers/auth");

router.get("/modulos/produccion/crearproducto", isAuthenticated, rendercrearproducto);
router.post("/modulos/produccion/crearproducto", isAuthenticated, crearproducto);
router.get("/modulos/produccion", isAuthenticated, renderFormulas);
router.get("/modulos/produccion/agregarformula", isAuthenticated, renderagregarformula);
router.post("/modulos/produccion/agregarformula", isAuthenticated, agregarformula);
module.exports = router;
