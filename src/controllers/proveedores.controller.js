const usersCtrl = {};
const Proveedor = require("../models/Proveedor")
const auth = require("../helpers/auth");
const mensajes = require("../helpers/mensajes")
const Mensaje = require("../models/Mensaje");
const Compra = require("../models/Compra")

usersCtrl.agregarProveedor = async (req, res) => {
  try {
    const { name, telefono, direccion } = req.body
    const proveedor = await Proveedor.findOne({ name: name }).collation({ locale: "es", strength: 2 })
    if (proveedor != null) {
      req.flash("error_msg", "Ya existe un proveedor registrado con este nombre/razon social");
      res.redirect("/modulos/compras");
    } else {
      const nuevoProveedor = new Proveedor({ "name": name, "direccion": direccion, "telefono": telefono, "deuda": 0, "editable": 0 })
      await nuevoProveedor.save()
      res.redirect("/modulos/compras");
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};

usersCtrl.renderListaproveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.find().lean();
    const msgs = await mensajes.mensajes()
    let deudatotal = 0
    proveedores.forEach(element => {
      deudatotal += element.deuda
    });
    res.render("moduls/compras/listaproveedores", { "proveedores": proveedores, "mensajes": msgs, "deudatotal": deudatotal.toFixed(2) })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};

usersCtrl.renderagregarproveedor = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    res.render("moduls/compras/agregarproveedor", { "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};

usersCtrl.rendereditarproveedor = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    const proveedor = await Proveedor.findById(req.params.id).lean();
    res.render("moduls/compras/editarproveedor", { "mensajes": msgs, "proveedor": proveedor })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};
usersCtrl.editarProveedor = async (req, res) => {
  try {
    const { name, telefono, direccion } = req.body
    const proveedor = await Proveedor.findOne({ name: name }).collation({ locale: "es", strength: 2 })
    if (proveedor != null) {
      req.flash("error_msg", "Ya existe un proveedor registrado con este nombre/razon social");
      res.redirect("/modulos/compras");
    } else {
      await Proveedor.findByIdAndUpdate(req.params.id, { "name": name, "direccion": direccion, "telefono": telefono, "editable": 0 })
      res.redirect("/modulos/compras");
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};





usersCtrl.solicitaredicion = async (req, res) => {
  try {
    const { idproveedor } = req.body
    const newMensaje = new Mensaje({
      "idproveedor": idproveedor,
      "idusuario": req.user._id,
      "tipooperacion": "editar",
      "tipoelemento": "proveedor"
    });
    await Proveedor.findByIdAndUpdate(idproveedor, { "editable": 2 })
    await newMensaje.save();
    res.redirect("/modulos/compras");

  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}


usersCtrl.reporteproveedores = async (req, res) => {
  try {
    const { fechainicio, fechafin } = req.body
    const [año, mes, dia] = fechainicio.split('-');
    const [año1, mes1, dia1] = fechafin.split('-');
    const fechaInicioMes = new Date(año, mes - 1, dia);
    const fechaFinMes = new Date(año1, mes1 - 1, dia1);
    console.log(fechaInicioMes, fechaFinMes)
    const provee = await Compra.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fechaInicioMes,
            $lte: fechaFinMes
          }
        }
      }
    ])
    let total = 0
    for (let i = 0; i < provee.length; i++) {
      provee[i].proveedor = await Proveedor.findById(provee[i]._id, 'name').lean()
      total += provee[i].total
      provee[i].total.toFixed(2)
    }
    total = total.toFixed(2)
    res.render("moduls/compras/reporteproveedores", { "proveedores": provee, "total": total, "fechainicio": fechainicio, "fechafin": fechafin })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}



module.exports = usersCtrl;