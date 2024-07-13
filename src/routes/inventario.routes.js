const { Router } = require("express");
const router = Router();

const {
  renderListaProductos, addProducto, renderAgregarProducto, despachaProductoo, ingresarProductoo,renderHistorialPoductos, solicitaredicion, rendereditar, editarproducto
} = require("../controllers/inventario.controller");

const { isAuthenticated} = require("../helpers/auth");


router.get("/modulos/inventario", isAuthenticated, renderListaProductos);
router.post("/modulos/inventario/add",isAuthenticated, addProducto);
router.get("/modulos/inventario/add",isAuthenticated, renderAgregarProducto);
router.post("/modulos/inventario/despachar/:id",isAuthenticated, despachaProductoo);
router.post("/modulos/inventario/ingresar/:id",isAuthenticated, ingresarProductoo);
router.get("/modulos/inventario/editar/:id",isAuthenticated, rendereditar);
router.post("/modulos/inventario/editar/:id",isAuthenticated, editarproducto);
router.get("/modulos/inventario/:id", isAuthenticated, renderHistorialPoductos);
router.post("/modulos/inventario/speproducto", isAuthenticated, solicitaredicion);
module.exports = router;
