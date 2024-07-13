const invrioCtrl = {};
const Proveedor = require("../models/Proveedor");
const Despacho = require("../models/Despacho");
const Entrada = require("../models/Entrada");
const Registro = require("../models/Registro");
const Mensaje = require("../models/Mensaje");
const mensajes = require("../helpers/mensajes")
const Balanceado = require("../models/Balanceado")


invrioCtrl.renderListaProductos = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    const balanceados = await Balanceado.find().lean()
    res.render("moduls/inventariobalanceado/productslist", { "balanceados": balanceados, "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};


invrioCtrl.rendereditar = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    const balanceado = await Balanceado.findById(req.params.id).lean()
    res.render("moduls/inventariobalanceado/editproduct", { "balanceado": balanceado, "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};



invrioCtrl.addProducto = async (req, res) => {
  try {
    const errors = [];
    const { name } = req.body;
    const balanceado = await Balanceado.findOne({ "name": name }).collation({ locale: "es", strength: 2 })
    if (balanceado) {
      req.flash("success_msg", "Ya existe un balanceado con este nombre");
      res.redirect("/modulos/inventariobalanceado");
    } else {
      const newProducto = new Balanceado({
        "name": name,
        "cantidad": 0,
        "editable": 0,
      });
      const aux = await newProducto.save()
      req.flash("success_msg", "Producto agregado exitosamente");
      res.redirect("/modulos/inventariobalanceado");
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}



invrioCtrl.editarproducto = async (req, res) => {
  try {
    const errors = [];
    const { name } = req.body;
    await Balanceado.findByIdAndUpdate(req.params.id, {
      "name": name,
      "editable": 0
    })
    req.flash("success_msg", "Producto modificado exitosamente");
    res.redirect("/modulos/inventario3");
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


invrioCtrl.despachaProductoo = async (req, res) => {
  try {
    const id = req.params.id
    const { cantidad, detalle } = req.body;
    const producto = await Balanceado.findOne({ _id: id });
    if (cantidad > producto.cantidad) {
      req.flash("success_msg", "No existe suficiente cantidad de producto");
      res.redirect("/modulos/inventariobalanceado");

    } else {
      const nuevacantidad = producto.cantidad - cantidad
      await Balanceado.findByIdAndUpdate(id, { "cantidad": nuevacantidad })
      const newDespacho = new Despacho({
        "idproducto": id,
        "cantidad": cantidad,
        "idusuario": req.user._id,
        "detalle": detalle
      });
      await newDespacho.save();
      const pro = await Balanceado.findById(id)
      const newRegistro = new Registro({
        "idproducto": id, "cantidad": -cantidad,
        "idusuario": req.user._id,
        "tipooperacion": "salida",
        "detalle": detalle,
        "cantidadactual": pro.cantidad
      });
      await newRegistro.save()
      req.flash("success_msg", "Despacho realizado correctamente");
      res.redirect("/modulos/inventariobalanceado");
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
    const producto = await Balanceado.findOne({ _id: id });
    const nuevacantidad = producto.cantidad + Number(cantidad)
    await Balanceado.findByIdAndUpdate(id, { "cantidad": nuevacantidad })
    const newEntrada = new Entrada({
      "idproducto": id,
      "cantidad": cantidad,
      "idusuario": req.user._id,
      "detalle": detalle
    });
    await newEntrada.save();
    const pro = await Balanceado.findById(id)
    const newRegistro = new Registro({
      "idproducto": id, "cantidad": cantidad,
      "idusuario": req.user._id,
      "tipooperacion": "ingreso",
      "detalle": detalle,
      "cantidadactual": pro.cantidad
    });
    await newRegistro.save()
    req.flash("success_msg", "Ingreso realizado correctamente");
    res.redirect("/modulos/inventariobalanceado");
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

invrioCtrl.solicitaredicion = async (req, res) => {
  try {
    const { idproducto } = req.body
    const newMensaje = new Mensaje({
      "idproducto": idproducto,
      "idusuario": req.user._id,
      "tipooperacion": "editar",
      "tipoelemento": "producto"
    });
    await Balanceado.findByIdAndUpdate(idproducto, { "editable": 2 })
    await newMensaje.save();
    res.redirect("/modulos/inventariobalanceado");
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


invrioCtrl.renderAgregarProducto = async (req, res) => {
  try {
    const proveedores = await Proveedor.find().lean()
    const msgs = await mensajes.mensajes()
    res.render("moduls/inventariobalanceado/createproduct", { "proveedores": proveedores, "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


invrioCtrl.renderHistorialPoductos = async (req, res) => {
  try {
    const monto = (await Balanceado.findById(req.params.id)).cantidad
    const operaciones = await Registro.find({ "idproducto": req.params.id }).populate("idusuario").lean()
    operaciones.forEach(element => {
      element.createdAt = convertirFecha(element.createdAt)
    });
    const msgs = await mensajes.mensajes()
    res.render("moduls/inventariobalanceado/historialproducto", { "id": req.params.id, "operaciones": operaciones, "mensajes": msgs, "monto": monto })
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