const ventasCtrl = {}
const Producto = require("../models/Producto")
const Venta = require("../models/Venta")
const Proveedor = require("../models/Proveedor")
const Pagoventa = require("../models/Pagoventa")
const Cliente = require("../models/Cliente")
const mensajes = require("../helpers/mensajes")
const Mensaje = require("../models/Mensaje")


function tokenizeByDollar(text) {

  const tokens = text.split(/\$/);
  return tokens.filter(token => token.length > 0);
}

ventasCtrl.agregarventa = async (req, res) => {
  try {
    const { codigoventa, detalle, productos, cantidad, total, precio, descuento, subtotal, iva } = req.body
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
    const clienteaux = await Cliente.findById(req.params.id)
    const nuevadeuda = Math.round((clienteaux.deuda + Number(total)) * 100) / 100
    await Cliente.updateOne({ "_id": req.params.id }, { "deuda": nuevadeuda })
    const venta = new Venta({
      "codigoventa": codigoventa, "idcliente": req.params.id, "productos": productos1, "precios": precios1,
      "cantidad": cantidad1, "total": total, "subtotal": subtotal, "detalle": detalle,
      "descuento": descuento, "montoporpagar": total, "retencion": 0, "editable": 0, "iva": iva
    })
    await venta.save()
    res.redirect(`/modulos/ventas/${req.params.id}`)
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

ventasCtrl.renderagregarventa = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    res.render("moduls/ventas/agregarventa", { "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

ventasCtrl.renderventas = async (req, res) => {
  try {

    const ventas = await Venta.find({ "idcliente": req.params.id }).lean()
    const ventasporpagar = []
    const ventascanceladas = []
    for (let i = 0; i < ventas.length; i++) {
      ventas[i].pagos = await Pagoventa.find({ "venta": ventas[i]._id }).lean()
      if (req.user.rol == "admin") {
        ventas[i].pagos.forEach(element => {
          element.isAdmin = true
        });
      }
    }
    const cliente = await Cliente.findById(req.params.id).lean()
    for (let i = 0; i < ventas.length; i++) {
      const productosaux = []
      for (let j = 0; j < ventas[i].productos.length; j++) {
        productosaux.push({
          "name": ventas[i].productos[j],
          "precio": ventas[i].precios[j],
          "cantidad": ventas[i].cantidad[j],
          "totalproducto": (ventas[i].cantidad[j] * ventas[i].precios[j]).toFixed(2)
        })
      }
      ventas[i].productosdet = productosaux
      if (ventas[i].montoporpagar > 0) {
        ventasporpagar.push(ventas[i])
      } else {
        ventascanceladas.push(ventas[i])
      }
    }




    const msgs = await mensajes.mensajes()
    res.render("moduls/ventas/listaventas", { "ventas": ventasporpagar.reverse(), "ventasp": ventascanceladas.reverse(), "id": req.params.id, "mensajes": msgs, "cliente": cliente })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}



ventasCtrl.agregarpago = async (req, res) => {
  try {

    const { monto, tipo, idventa, bancocheque,
      numerocuentacheque, numerocheque, fechagirocheque, tipoefectivo, bancodestinotransferencia, bancoorigentransferencia,
      cuentadestinotransferencia, cuentaorigentransferencia } = req.body
    const vent = await Venta.findById(idventa)
    if (Number(monto) > vent.montoporpagar) {
      res.redirect(`/modulos/ventas/${req.params.id}`)
    } else {
      await Venta.updateOne({ "_id": idventa }, { "montoporpagar": vent.montoporpagar - Number(monto).toFixed(2) })
      const ventaaux = await Venta.findById(idventa)
      const client = await Cliente.findById(ventaaux.idcliente)
      await Cliente.updateOne({ "_id": ventaaux.idcliente }, { "deuda": client.deuda - monto })
      const pago = new Pagoventa({
        "tipodepago": tipo, "venta": idventa, "monto": monto, "bancocheque": bancocheque,
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
      res.redirect(`/modulos/ventas/${req.params.id}`)
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


ventasCtrl.actualizarretencion = async (req, res) => {
  try {
    const { retencion, idventa } = req.body
  const venta = await Venta.findById(idventa).lean()
  if (retencion >= venta.montoporpagar) {
    req.flash("success_msg", "La retención debe ser menor al monto a pagar");
    res.redirect(`/modulos/ventas/${req.params.id}`)
  } else {
    const aux = venta.total - retencion
    const aux1 = venta.retencion - retencion
    const client = await Cliente.findById(venta.idcliente)
    await Cliente.findOneAndUpdate({ "_id": venta.idcliente }, { "deuda": client.deuda + aux1 })
    await Venta.updateOne({ "_id": idventa }, { "retencion": retencion, "montoporpagar": aux.toFixed(2) })
    res.redirect(`/modulos/ventas/${req.params.id}`)
  }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


ventasCtrl.solicitaredicionventa = async (req, res) => {
  try {
    const { idventa } = req.body
    const newMensaje = new Mensaje({
      "idventa": idventa,
      "idusuario": req.user._id,
      "tipooperacion": "eliminar",
      "tipoelemento": "venta"
    });
    await Venta.findByIdAndUpdate(idventa, { "editable": 2 })
    const pg = await Venta.findById(idventa)
    await newMensaje.save();
    res.redirect(`/modulos/ventas/${pg.idcliente}`);
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

ventasCtrl.solicitaredicionpagoventa = async (req, res) => {
  try {
    const { idpago } = req.body
    const newMensaje = new Mensaje({
      "idpagoventa": idpago,
      "idusuario": req.user._id,
      "tipooperacion": "eliminar",
      "tipoelemento": "pagoventa"
    });
    await Pagoventa.findByIdAndUpdate(idpago, { "editable": 2 })
    const pg = await Pagoventa.findById(idpago).populate("venta")
    await newMensaje.save();
    res.redirect(`/modulos/ventas/${pg.venta.idcliente}`);
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


ventasCtrl.eliminarpago = async (req, res) => {
  try {
    const { idpago } = req.body
    const pago = await Pagoventa.findById(idpago)
    const venta1 = await Venta.findById(pago.venta)
    const venta = await Venta.findByIdAndUpdate(pago.venta, { "montoporpagar": venta1.montoporpagar + pago.monto })
    const cliente1 = await Cliente.findById(venta.idcliente)
    await Cliente.findByIdAndUpdate(venta.idcliente, { "deuda": cliente1.deuda - pago.monto })
    await Pagoventa.findByIdAndDelete(idpago)
    res.redirect(`/modulos/ventas/${venta.idcliente}`)

  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

ventasCtrl.eliminarventa = async (req, res) => {
  try {
    const { venta, cliente } = req.body
    const ventaaux = await Venta.findById(venta)
    const pagos = await Pagoventa.find({ "venta": venta })
    if (pagos == null) {
      req.flash("success_msg", "Para eliminar una venta no debe tener asociado un pago");
      res.redirect(`/modulos/ventas/${cliente}`)
    } else {
      const cliente1 = await Cliente.findById(ventaaux.idcliente)
      await Cliente.findByIdAndUpdate(ventaaux.idcliente, { "deuda": cliente1.deuda - ventaaux.montoporpagar })
      await Venta.findByIdAndDelete(venta)
      res.redirect(`/modulos/ventas/${cliente}`)
    }

  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}













module.exports = ventasCtrl

