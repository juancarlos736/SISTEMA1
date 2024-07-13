const { Router } = require("express");
const router = Router();

const { agregarcompra, rendercompras, renderagregarcompra, agregarpago, actualizarretencion, solicitaredicioncompra, solicitaredicionpagocompra, eliminarcompra,eliminarpago } = require("../controllers/compras.controller");

const { isAuthenticated} = require("../helpers/auth");

router.get("/modulos/compras/nuevacompra", isAuthenticated, renderagregarcompra );
router.post("/modulos/compras/nuevacompra/:id", isAuthenticated, agregarcompra );
router.post("/modulos/compras/nuevopago/:id", isAuthenticated, agregarpago );
router.get("/modulos/compras/:id", isAuthenticated, rendercompras );
router.post("/modulos/compras/agregarretencion/:id", isAuthenticated, actualizarretencion );
router.post("/modulos/compras/specompra", isAuthenticated, solicitaredicioncompra );
router.post("/modulos/compras/spepago", isAuthenticated, solicitaredicionpagocompra );
router.delete("/modulos/compras/eliminarpago", isAuthenticated, eliminarpago );
router.delete("/modulos/compras/eliminarcompra", isAuthenticated, eliminarcompra);
module.exports = router;
