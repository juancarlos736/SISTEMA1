const { Router } = require("express");
const router = Router();

const {
  renderListaProductos, addProducto, renderAgregarProducto, despachaProductoo, ingresarProductoo,renderHistorialPoductos, solicitaredicion, rendereditar, editarproducto
} = require("../controllers/inventario3.controller");

const { isAuthenticated} = require("../helpers/auth");


router.get("/modulos/inventariobalanceado", isAuthenticated, renderListaProductos);
router.post("/modulos/inventario3/add",isAuthenticated, addProducto);
router.get("/modulos/inventario3/add",isAuthenticated, renderAgregarProducto);
router.post("/modulos/inventario3/despachar/:id",isAuthenticated, despachaProductoo);
router.post("/modulos/inventario3/ingresar/:id",isAuthenticated, ingresarProductoo);
router.get("/modulos/inventario3/editar/:id",isAuthenticated, rendereditar);
router.post("/modulos/inventario3/editar/:id",isAuthenticated, editarproducto);
router.get("/modulos/inventario3/:id", isAuthenticated, renderHistorialPoductos);
router.post("/modulos/inventario3/speproducto", isAuthenticated, solicitaredicion);
module.exports = router;
