const usersCtrl = {};
const Cliente = require("../models/Cliente")
const auth = require("../helpers/auth");
const mensajes = require("../helpers/mensajes")
const Mensaje = require("../models/Mensaje")
const Venta = require("../models/Venta")

usersCtrl.agregarCliente = async (req, res) => {
  try {
    const { name, telefono, direccion } = req.body
    const cliente = await Cliente.findOne({ name: name }).collation({ locale: "es", strength: 2 })
    if (cliente != null) {
      req.flash("error_msg", "Ya existe un cliente registrado con este nombre/razon social");
      res.redirect("/modulos/ventas");
    } else {
      const nuevoCliente = new Cliente({
        "name": name, "direccion": direccion,
        "telefono": telefono, "deuda": 0, "editable": 0
      })
      await nuevoCliente.save()
      res.redirect("/modulos/ventas");
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};

usersCtrl.renderListaclientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().lean();
    const msgs = await mensajes.mensajes()
    let deudatotal = 0
    clientes.forEach(element => {
      deudatotal += element.deuda
    });
    res.render("moduls/ventas/listaclientes", { "clientes": clientes, "mensajes": msgs, "deudatotal": deudatotal.toFixed(2) })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos/")
  }
};

usersCtrl.renderagregarcliente = async (req, res) => {
  try {
    const msgs = await mensajes.mensajes()
    res.render("moduls/ventas/agregarcliente", { "mensajes": msgs })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};

usersCtrl.rendereditarcliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    const msgs = await mensajes.mensajes()
    res.render("moduls/ventas/editarcliente", { "mensajes": msgs, "cliente": cliente })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};
usersCtrl.editarCliente = async (req, res) => {
  try {
    const { name, telefono, direccion } = req.body
    const clienteaux = await Cliente.findOne({ "name": name }).collation({ locale: "es", strength: 2 })
    if (clienteaux) {
      req.flash("success_msg", "Ya existe un cliente con este nombre");
      res.redirect("/modulos/ventas");
    } else {
      await Cliente.findByIdAndUpdate(req.params.id, {
        "name": name, "direccion": direccion,
        "telefono": telefono, "editable": 0
      })
      const msgs = await mensajes.mensajes()
      res.redirect("/modulos/ventas");
    }
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
};

usersCtrl.solicitaredicion = async (req, res) => {
  try {
    const { idcliente } = req.body
    const newMensaje = new Mensaje({
      "idcliente": idcliente,
      "idusuario": req.user._id,
      "tipooperacion": "editar",
      "tipoelemento": "cliente"
    });
    await Cliente.findByIdAndUpdate(idcliente, { "editable": 2 })
    await newMensaje.save();
    res.redirect("/modulos/ventas");
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}

usersCtrl.reporteclientes = async (req, res) => {
  try {
    const { fechainicio, fechafin } = req.body
    const [año, mes, dia] = fechainicio.split('-');
    const [año1, mes1, dia1] = fechafin.split('-');
    const fechaInicioMes = new Date(año, mes - 1, dia);
    const fechaFinMes = new Date(año1, mes1 - 1, dia1);
    console.log(fechaInicioMes, fechaFinMes)
    const clientes = await Venta.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fechaInicioMes,
            $lte: fechaFinMes
          }
        }
      },
      {
        $project: {
          productos: 1,
          precios: 1,
          cantidad: 1,
          idcliente: 1
        }
      }
    ])
    let total = 0
    let clientes2 = {}
    for (let i = 0; i < clientes.length; i++) {
      if (!(clientes[i].idcliente in clientes2)) {
        clientes2[clientes[i].idcliente] = {
          "balanceado": { total: 0, "name": "balanceado" },
          "pollos": { total: 0, "name": "pollos" },
          "cerdos": { total: 0, "name": "cerdos" },
          "otros": { total: 0, "name": "otros" }
        }
        clientes2[clientes[i].idcliente].name = await Cliente.findById(clientes[i].idcliente, "name").lean()
        clientes2[clientes[i].idcliente].total = 0
      }
      for (let j = 0; j < clientes[i].productos.length; j++) {
        clientes[i].precios[j] = clientes[i].precios[j] * clientes[i].cantidad[j]
        clientes2[clientes[i].idcliente][clientes[i].productos[j]].total += clientes[i].precios[j]
        clientes2[clientes[i].idcliente].total += clientes[i].precios[j]
        total += clientes[i].precios[j]
      }
    }

    console.log(clientes)
    console.log(clientes2)
    res.render("moduls/ventas/reporteclientes", { "clientes": clientes2, "total": total, "fechainicio": fechainicio, "fechafin": fechafin })
  } catch (error) {
    req.flash("error_msg", "Ha ocurrido un error");
    res.redirect("/modulos")
  }
}



module.exports = usersCtrl;