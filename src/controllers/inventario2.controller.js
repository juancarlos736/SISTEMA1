const invrioCtrl = {};
const Producto = require("../models/Producto");
const Proveedor = require("../models/Proveedor");
const Despacho = require("../models/Despacho");
const Entrada = require("../models/Entrada");
const Registro = require("../models/Registro");
const Mensaje = require("../models/Mensaje");
const mensajes = require("../helpers/mensajes")



invrioCtrl.renderListaProductos = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    const productos = await Producto.find({ "inventario": 2 }).lean()
    productos.isAdmin = req.user.isAdmin
    res.render("moduls/inventario2/productslist", { "productos": productos, "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};


invrioCtrl.despachaProductoo = async (req, res) => {
  try {
    const id = req.params.id
    const { cantidad, detalle } = req.body;
    const producto = await Producto.findOne({ _id: id });
    if (cantidad > producto.cantidad) {
      req.flash("success_msg", "No existe suficiente cantidad de producto");
      res.redirect("/modulos/inventarioexterior");

    } else {
      const nuevacantidad = producto.cantidad - cantidad
      await Producto.findByIdAndUpdate(id, { "cantidad": nuevacantidad })
      const newDespacho = new Despacho({
        "idproducto": id,
        "cantidad": cantidad,
        "idusuario": req.user._id,
        "detalle": detalle
      });
      await newDespacho.save();
      const pro = await Producto.findById(id)
      const newRegistro = new Registro({
        "idproducto": id, "cantidad": -cantidad,
        "idusuario": req.user._id,
        "tipooperacion": "salida",
        "detalle": detalle,
        "cantidadactual": pro.cantidad
      });
      await newRegistro.save()
      req.flash("success_msg", "Despacho realizado correctamente");
      res.redirect("/modulos/inventarioexterior");
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


invrioCtrl.ingresarProductoo = async (req, res) => {
  try {
    const id = req.params.id
    const { cantidad, detalle } = req.body;
    const producto = await Producto.findOne({ _id: id });
    const nuevacantidad = producto.cantidad + Number(cantidad)
    await Producto.findByIdAndUpdate(id, { "cantidad": nuevacantidad })
    const newEntrada = new Entrada({
      "idproducto": id,
      "cantidad": cantidad,
      "idusuario": req.user._id,
      "detalle": detalle
    });
    await newEntrada.save();
    const pro = await Producto.findById(id)
    const newRegistro = new Registro({
      "idproducto": id, "cantidad": cantidad,
      "idusuario": req.user._id,
      "tipooperacion": "entrada",
      "detalle": detalle,
      "cantidadactual": pro.cantidad
    });
    await newRegistro.save()
    req.flash("success_msg", "Ingreso realizado correctamente");
    res.redirect("/modulos/inventarioexterior");
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}



invrioCtrl.renderAgregarProducto = async (req, res) => {
  try {
    const proveedores = await Proveedor.find().lean()
    const msgs = await mensajes.mensajes()
    res.render("moduls/inventario2/createproduct", { "proveedores": proveedores, "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


invrioCtrl.renderHistorialPoductos = async (req, res) => {
  try {
    const monto = (await Producto.findById(req.params.id)).cantidad
    const operaciones = await Registro.find({ "idproducto": req.params.id }).populate("idusuario").lean()
    operaciones.forEach(element => {
      element.createdAt = convertirFecha(element.createdAt)
    });
    const msgs = await mensajes.mensajes()
    res.render("moduls/inventario2/historialproducto", { "id": req.params.id, "operaciones": operaciones, "mensajes": msgs, "monto": monto })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

function convertirFecha(cadena) {
  var fecha = new Date(cadena);
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1;
  var año = fecha.getFullYear();
  var horas = fecha.getHours();
  var minutos = fecha.getMinutes();
  var segundos = fecha.getSeconds();
  dia = dia < 10 ? '0' + dia : dia;
  mes = mes < 10 ? '0' + mes : mes;
  horas = horas < 10 ? '0' + horas : horas;
  minutos = minutos < 10 ? '0' + minutos : minutos;
  segundos = segundos < 10 ? '0' + segundos : segundos;
  var resultado = `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
  return resultado;
}







module.exports = invrioCtrl