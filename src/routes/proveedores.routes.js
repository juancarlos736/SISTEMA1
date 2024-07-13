const { Router } = require("express");
const router = Router();

const {
    agregarProveedor, renderListaproveedores, renderagregarproveedor, rendereditarproveedor, editarProveedor, solicitaredicion,
    reporteproveedores
} = require("../controllers/proveedores.controller");


const { isAuthenticated, isAdmin } = require("../helpers/auth");
/*********************/
router.get("/modulos/compras", isAuthenticated, renderListaproveedores);
router.get("/modulos/compras/agregarproveedor", isAuthenticated, renderagregarproveedor);
router.get("/modulos/compras/editarproveedor/:id", isAuthenticated, rendereditarproveedor);
router.post("/modulos/compras/editarproveedor/:id", isAuthenticated, editarProveedor);
router.post("/modulos/compras/agregarproveedor", isAuthenticated, agregarProveedor);
router.post("/modulos/compras/speproveedor", isAuthenticated, solicitaredicion);
router.post("/modulos/compras/reporteproveedores", isAuthenticated, reporteproveedores)
module.exports = router;
