const { Router } = require("express");
const router = Router();

const {
agregarProveedor, renderListaproveedores, renderagregarproveedor, renderListaclientes, 
renderagregarcliente, agregarCliente, editarCliente, rendereditarcliente,solicitaredicion,
reporteclientes
} = require("../controllers/clientes.controller");


const { isAuthenticated, isAdmin } = require("../helpers/auth");
/*********************/
router.get("/modulos/ventas", isAuthenticated, renderListaclientes);
router.get("/modulos/ventas/agregarcliente", isAuthenticated, renderagregarcliente);
router.get("/modulos/ventas/editarcliente/:id", isAuthenticated, rendereditarcliente);
router.post("/modulos/ventas/editarcliente/:id", isAuthenticated, editarCliente);
router.post("/modulos/ventas/agregarcliente", isAuthenticated, agregarCliente);
router.post("/modulos/ventas/specliente", isAuthenticated, solicitaredicion);
router.post("/modulos/ventas/reporteclientes", isAuthenticated, reporteclientes)
module.exports = router;
