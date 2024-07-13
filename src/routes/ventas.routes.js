const { Router } = require("express");
const router = Router();

const { agregarcompra, rendercompras, renderagregarcompra, agregarpago, actualizarretencion, renderagregarventa, agregarventa, renderventas, solicitaredicionventa, solicitaredicionpagoventa, eliminarpago, eliminarventa } = require("../controllers/ventas.controller");

const { isAuthenticated} = require("../helpers/auth");

router.get("/modulos/ventas/nuevaventa", isAuthenticated, renderagregarventa );
router.post("/modulos/ventas/nuevaventa/:id", isAuthenticated, agregarventa );
router.post("/modulos/ventas/nuevopago/:id", isAuthenticated, agregarpago );
router.get("/modulos/ventas/:id", isAuthenticated, renderventas );
router.post("/modulos/ventas/agregarretencion/:id", isAuthenticated, actualizarretencion );
router.post("/modulos/ventas/speventa", isAuthenticated, solicitaredicionventa );
router.post("/modulos/ventas/spepago", isAuthenticated, solicitaredicionpagoventa );
router.delete("/modulos/ventas/eliminarpago", isAuthenticated, eliminarpago );
router.delete("/modulos/ventas/eliminarventa", isAuthenticated, eliminarventa );
module.exports = router;
