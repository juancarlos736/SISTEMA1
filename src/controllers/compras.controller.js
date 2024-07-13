const comprasCtrl = {}
const Producto = require("../models/Producto")
const Compra = require("../models/Compra")
const Proveedor = require("../models/Proveedor")
const Pago = require("../models/Pago")
const mensajes = require("../helpers/mensajes")
const Mensaje = require("../models/Mensaje");
const Registro = require("../models/Registro");




comprasCtrl.agregarcompra = async (req, res) => {
  try {
    const { codigocompra, detalle, productos, cantidad, total, precio, descuento, subtotal, iva } = req.body
    let productos1 = []
    let cantidad1 = []
    let precios1 = []
    if (typeof productos != "object") {
      productos1.push(productos)
      cantidad1.push(cantidad)
      precios1.push(precio)
    } else {
      productos1 = productos
      cantidad1 = cantidad
      precios1 = precio
    }

    for (let i = 0; i < productos1.length; i++) {
      const pro = await Producto.findById(productos1[i])
      await Producto.findByIdAndUpdate({ "_id": productos1[i] }, { "cantidad": Number(cantidad1[i]) + pro.cantidad, "precio": precios1[i] })
      const pro1 = await Producto.findById(productos1[i])
      const newRegistro = new Registro({
        "idproducto": productos1[i], "cantidad": cantidad1[i],
        "idusuario": req.user._id,
        "tipooperacion": "compra",
        "detalle": detalle,
        "cantidadactual": pro1.cantidad
      });
      await newRegistro.save()
    }
    const prov = await Proveedor.findById(req.params.id)
    await Proveedor.updateOne({ "_id": req.params.id }, { "deuda": Math.round((prov.deuda + Number(total)) * 100) / 100 })
    const compra = new Compra({
      "codigocompra": codigocompra, "idproveedor": req.params.id, "productos": productos1, "precios": precios1, "cantidad": cantidad1, "total": total, "subtotal": subtotal, "detalle": detalle, "descuento": descuento,
      "montoporpagar": total, "retencion": 0, "editable": 0, "iva": iva
    })
    await compra.save()
    res.redirect(`/modulos/compras/${req.params.id}`)
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

comprasCtrl.renderagregarcompra = async (req, res) => {
  try {
    const productos = await Producto.find().lean()
    const msgs = await mensajes.mensajes()
    res.render("moduls/compras/agregarcompra", { "productos": productos, "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


comprasCtrl.rendercompras = async (req, res) => {
  try {
    const compras = await Compra.find({ "idproveedor": req.params.id }).populate("productos").lean()
    const productos = await Producto.find({ "idproveedor": req.params.id, "inventario": 1 }).lean()
    const comprasporpagar = []
    const comprascanceladas = []
    for (let i = 0; i < compras.length; i++) {
      compras[i].pagos = await Pago.find({ "compra": compras[i]._id }).lean()
      if (req.user.rol == "admin") {
        compras[i].pagos.forEach(element => {
          element.isAdmin = true
        });
      }
    }
    const proveedor = await Proveedor.findById(req.params.id).lean()
    for (let i = 0; i < compras.length; i++) {
      const productosaux = []
      for (let j = 0; j < compras[i].productos.length; j++) {
        productosaux.push({
          "name": compras[i].productos[j].name,
          "precio": compras[i].productos[j].precio,
          "cantidad": compras[i].cantidad[j],
          "totalproducto": (compras[i].cantidad[j] * compras[i].productos[j].precio).toFixed(2)
        })
      }
      compras[i].productosdet = productosaux
      if (compras[i].montoporpagar > 0) {
        comprasporpagar.push(compras[i])
      } else {
        comprascanceladas.push(compras[i])
      }
    }
    const msgs = await mensajes.mensajes()
    res.render("moduls/compras/listacompras", { "compras": comprasporpagar.reverse(), "comprasc": comprascanceladas.reverse(), "id": req.params.id, "productos": productos, "mensajes": msgs, "proveedor": proveedor })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


comprasCtrl.agregarpago = async (req, res) => {
  try {
    const { monto, tipo, idcompra, bancocheque,
      numerocuentacheque, numerocheque, fechagirocheque, tipoefectivo,
      bancodestinotransferencia, bancoorigentransferencia,
      cuentadestinotransferencia, cuentaorigentransferencia } = req.body
    const compra = await Compra.findById(idcompra)
    if (Number(monto) > compra.montoporpagar) {
      res.redirect(`/modulos/compras/${req.params.id}`)
    } else {
      await Compra.updateOne({ "_id": idcompra }, { "montoporpagar": compra.montoporpagar - Number(monto) })

      const compraaux = await Compra.findById(idcompra)
      const provee = await Proveedor.findById(compraaux.idproveedor)

      await Proveedor.updateOne({ "_id": compraaux.idproveedor }, { "deuda": provee.deuda - monto })
      const pago = new Pago({
        "tipodepago": tipo, "compra": idcompra, "monto": monto, "bancocheque": bancocheque,
        "numerocuentacheque": numerocuentacheque,
        "numerocheque": numerocheque,
        "fechagirocheque": fechagirocheque,
        "tipoefectivo": tipoefectivo,
        "bancoorigentransferencia": bancoorigentransferencia,
        "cuentaorigentransferencia": cuentaorigentransferencia,
        "bancodestinotransferencia": bancodestinotransferencia,
        "cuentadestinotransferencia": cuentadestinotransferencia,
        "editable": 0
      })
      await pago.save()
      res.redirect(`/modulos/compras/${req.params.id}`)
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


comprasCtrl.actualizarretencion = async (req, res) => {
  try {
    const { retencion, idcompra } = req.body
    const compra = await Compra.findById(idcompra).lean()
    const provee = await Proveedor.findById(compra.idproveedor)
    const aux1 = compra.retencion - retencion
    const aux = compra.total - retencion
    await Proveedor.findOneAndUpdate({ "_id": compra.idproveedor }, { "deuda": provee.deuda + aux1 })
    await Compra.updateOne({ "_id": idcompra }, { "retencion": retencion, "montoporpagar": aux.toFixed(2) })
    res.redirect(`/modulos/compras/${req.params.id}`)
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


comprasCtrl.solicitaredicioncompra = async (req, res) => {
  try {
    const { idcompra } = req.body
    const newMensaje = new Mensaje({
      "idcompra": idcompra,
      "idusuario": req.user._id,
      "tipooperacion": "eliminar",
      "tipoelemento": "compra"
    });
    await Compra.findByIdAndUpdate(idcompra, { "editable": 2 })
    const pg = await Compra.findById(idcompra)
    await newMensaje.save();
    res.redirect(`/modulos/compras/${pg.idproveedor}`);
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

comprasCtrl.solicitaredicionpagocompra = async (req, res) => {
  try {
    const { idpago } = req.body
    const newMensaje = new Mensaje({
      "idpagocompra": idpago,
      "idusuario": req.user._id,
      "tipooperacion": "eliminar",
      "tipoelemento": "pagocompra"
    });
    await Pago.findByIdAndUpdate(idpago, { "editable": 2 })
    const pg = await Pago.findById(idpago).populate("compra")
    await newMensaje.save();

    res.redirect(`/modulos/compras/${pg.compra.idproveedor}`);
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


comprasCtrl.eliminarpago = async (req, res) => {
  try {
    const { idpago } = req.body
    const pago = await Pago.findById(idpago)
    const compra = await Compra.findById(pago.compra)
    await Compra.findByIdAndUpdate(pago.compra, { "montoporpagar": compra.montoporpagar + pago.monto })
    const provee = await Proveedor.findById(compra.idproveedor)
    await Proveedor.findByIdAndUpdate(compra.idproveedor, { "deuda": provee.deuda + pago.monto })
    await Pago.findByIdAndDelete(idpago)
    res.redirect(`/modulos/ventas/${compra.idproveedor}`)
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

comprasCtrl.eliminarcompra = async (req, res) => {
  try {
    const { idcompra, idproveedor } = req.body
    const compraaux = await Compra.findById(idcompra)
    const pagos = await Pago.find({ "compra": idcompra })
    if (pagos == null) {
      req.flash("success_msg", "Para eliminar una compra no debe tener asociado un pago");
      res.redirect(`/modulos/compras/${idproveedor}`)
    } else {
      for (let i = 0; i < compraaux.productos.length; i++) {
        const prod = await Producto.findById(compraaux.productos[i])
        await Producto.findByIdAndUpdate(compraaux.productos[i], { "cantidad": prod.cantidad - compraaux.cantidad[i] })
      }
      const provee = await Proveedor.findById(compraaux.idproveedor)
      await Proveedor.findByIdAndUpdate(compraaux.idproveedor, { "deuda": provee.deuda - compraaux.montoporpagar })
      await Compra.findByIdAndDelete(idcompra)
      res.redirect(`/modulos/compras/${idproveedor}`)
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}











module.exports = comprasCtrl

