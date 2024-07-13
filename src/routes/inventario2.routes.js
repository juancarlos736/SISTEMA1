const { Router } = require("express");
const router = Router();

const {
  renderListaProductos, addProducto, renderAgregarProducto, despachaProductoo, ingresarProductoo,renderHistorialPoductos, solicitaredicion, rendereditar, editarproducto
} = require("../controllers/inventario2.controller");

const { isAuthenticated} = require("../helpers/auth");


router.get("/modulos/inventarioexterior", isAuthenticated, renderListaProductos);
router.post("/modulos/inventario2/despachar/:id",isAuthenticated, despachaProductoo);
router.post("/modulos/inventario2/ingresar/:id",isAuthenticated, ingresarProductoo);
router.get("/modulos/inventario2/:id", isAuthenticated, renderHistorialPoductos);
module.exports = router;
