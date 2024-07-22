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
    
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
  const msgs = await mensajes.mensajes()
  const productos = await Producto.find({ "inventario": 1 }).lean()
  productos.isAdmin = req.user.isAdmin
  res.render("moduls/inventario/productslist", { "productos": productos, "mensajes": msgs })
};


invrioCtrl.rendereditar = async (req, res) => {
  const msgs = await mensajes.mensajes()
  const producto = await Producto.findById(req.params.id).lean()
  const proveedores = await Proveedor.find().lean()
  res.render("moduls/inventario/editproduct", { "producto": producto, "mensajes": msgs, "proveedores": proveedores })
};



invrioCtrl.addProducto = async (req, res) => {
  const errors = [];
  const { name, precio, presentacion, proveedor, presentacionmagnitud } = req.body;
  const productoaux = await Producto.findOne({ "name": name }).collation({ locale: "es", strength: 2 })
  if (productoaux) {
    req.flash("success_msg", "Ya existe un producto con este nombre");
    res.redirect("/modulos/inventario");
  } else {
    const newProducto = new Producto({
      "name": name,
      "cantidad": 0,
      "precio": precio,
      "presentacion": presentacion,
      "idproveedor": proveedor,
      "editable": 0,
      "presentacionmagnitud": presentacionmagnitud,
      "inventario": 1
    });

    const aux = await newProducto.save()
    const newProducto2 = new Producto({
      "name": name,
      "cantidad": 0,
      "precio": precio,
      "presentacion": presentacion,
      "idproveedor": proveedor,
      "editable": 0,
      "presentacionmagnitud": presentacionmagnitud,
      "inventario": 2,
      "idproducto": aux._id
    });
    await newProducto2.save()
    req.flash("success_msg", "Producto agregado exitosamente");
    res.redirect("/modulos/inventario");
  }


}







invrioCtrl.editarproducto = async (req, res) => {
  const { name, precio, presentacion, proveedor, presentacionmagnitud } = req.body;
  const productoaux = await Producto.findOne({ "name": name }).collation({ locale: "es", strength: 2 })
  if (productoaux) {
    req.flash("success_msg", "Ya existe un producto con este nombre");
    res.redirect("/modulos/inventario");
  } else {
    await Producto.findByIdAndUpdate(req.params.id, {
      "name": name,
      "precio": precio,
      "presentacion": presentacion,
      "presentacionmagnitud": presentacionmagnitud,
      "idproveedor": proveedor,
      "editable": 0
    })
    await Producto.findOneAndUpdate({ "idproducto": req.params.id }, {
      "name": name,
      "precio": precio,
      "presentacion": presentacion,
      "presentacionmagnitud": presentacionmagnitud,
      "idproveedor": proveedor,
      "editable": 0
    })
    req.flash("success_msg", "Producto modificado exitosamente");
    res.redirect("/modulos/inventario");
  }
}









invrioCtrl.despachaProductoo = async (req, res) => {
  const id = req.params.id
  const { cantidad, detalle, ie } = req.body;
  const producto = await Producto.findOne({ _id: id });
  console.log(ie)
  if (ie == "si") {
    console.log("if")
    if (cantidad > producto.cantidad) {
      req.flash("success_msg", "No existe suficiente cantidad de producto");
      res.redirect("/modulos/inventario");

    } else {
      await Producto.findByIdAndUpdate(id, { $inc: { "cantidad": -cantidad } })
      const produ2 = await Producto.findOneAndUpdate({ "idproducto": id }, { $inc: { "cantidad": cantidad * producto.presentacion } })
      const produ3 = await Producto.findOne({ "idproducto": id })
      const newRegistro2 = new Registro({
        "idproducto": produ3._id, "cantidad": cantidad*produ3.presentacion,
        "idusuario": req.user._id,
        "tipooperacion": "entrada",
        "detalle": detalle,
        "cantidadactual": produ3.cantidad
      });
      await newRegistro2.save()
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
      res.redirect("/modulos/inventario");
    }
  } else {
    console.log("else")
    if (cantidad > producto.cantidad) {
      req.flash("success_msg", "No existe suficiente cantidad de producto");
      res.redirect("/modulos/inventario");

    } else {
      await Producto.findByIdAndUpdate(id, { $inc: { "cantidad": -cantidad } })
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
      res.redirect("/modulos/inventario");
    }
  }
}


invrioCtrl.ingresarProductoo = async (req, res) => {
  const id = req.params.id
  const { cantidad, detalle } = req.body;
  const producto = await Producto.findOne({ _id: id });
  const nuevacantidad = producto.cantidad + Number(cantidad)
  await Producto.findByIdAndUpdate(id, { "cantidad": nuevacantidad })
  const pro = await Producto.findById(id)
  const newRegistro = new Registro({
    "idproducto": id, "cantidad": cantidad,
    "idusuario": req.user._id,
    "tipooperacion": "ingreso",
    "detalle": detalle,
    "cantidadactual": pro.cantidad
  });
  await newRegistro.save()
  req.flash("success_msg", "Ingreso realizado correctamente");
  res.redirect("/modulos/inventario");

}

invrioCtrl.solicitaredicion = async (req, res) => {
  const { idproducto } = req.body
  const newMensaje = new Mensaje({
    "idproducto": idproducto,
    "idusuario": req.user._id,
    "tipooperacion": "editar",
    "tipoelemento": "producto"
  });
  await Producto.findByIdAndUpdate(idproducto, { "editable": 2 })
  await newMensaje.save();
  res.redirect("/modulos/inventario");

}























invrioCtrl.renderAgregarProducto = async (req, res) => {
  const proveedores = await Proveedor.find().lean()
  const msgs = await mensajes.mensajes()
  res.render("moduls/inventario/createproduct", { "proveedores": proveedores, "mensajes": msgs })
}


invrioCtrl.renderHistorialPoductos = async (req, res) => {
  const monto=(await Producto.findById(req.params.id)).cantidad
  
  const operaciones = await Registro.find({ "idproducto": req.params.id }).populate("idusuario").lean()
  operaciones.forEach(element => {
    element.createdAt = convertirFecha(element.createdAt)
  });
  const msgs = await mensajes.mensajes()
  res.render("moduls/inventario/historialproducto", { "id": req.params.id, "operaciones": operaciones, "mensajes": msgs,"monto":monto })
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