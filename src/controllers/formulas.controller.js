const formuCrtrl = {};
const Producto = require("../models/Producto");
const Formula = require("../models/Receta")
const Produccion = require("../models/Produccion");
const Registro = require("../models/Registro");
const Balanceado = require("../models/Balanceado");
const mensajes = require("../helpers/mensajes")

formuCrtrl.renderFormulas = async (req, res) => {
    try {
        const msgs = await mensajes.mensajes()
        const formulas = await Formula.find().populate("idbalanceado").populate("productos").lean()
        for (let i = 0; i < formulas.length; i++) {
            for (let j = 0; j < formulas[i].productos.length; j++) {
                formulas[i].productos[j].cantidadproducto = formulas[i].cantidadproducto[j]
                formulas[i].productos[j].preciosunitarios = formulas[i].preciosunitarios[j]
                formulas[i].productos[j].preciototalindividual = formulas[i].preciototalindividual[j]

            }

            for (let j = 0; j < formulas[i].costosadicionalesrazon.length; j++) {
                formulas[i].costosadicionalesrazon[j] = { "razon": formulas[i].costosadicionalesrazon[j] }
                formulas[i].costosadicionalesrazon[j].costo = formulas[i].costosadicionalesmonto[j]
            }
        }
        res.render("moduls/produccion/formulas", { "formulas": formulas, "mensajes": msgs })
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        res.redirect("/modulos")
    }
}

formuCrtrl.renderagregarformula = async (req, res) => {
    try {
        const msgs = await mensajes.mensajes()
        const productos = await Producto.find({ "inventario": 2 }).lean()
        const balanceados = await Balanceado.find().lean()
        res.render("moduls/produccion/agregarformula", { "productos": productos, "balanceados": balanceados, "mensajes": msgs })
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        res.redirect("/modulos")
    }
}


controlarcantidad = async (formula, cantidad) => {
    try {
        let salida = "No existe stock suficiente de: "
        let flag = true
        for (let i = 0; i < formula.productos.length; i++) {
            const producto = await Producto.findOne({ "_id": formula.productos[i] })
            if (formula.cantidadproducto[i] * Number(cantidad) > producto.cantidad) {
                salida += producto.name + ", cantidad necesaria: " + formula.cantidadproducto[i] * Number(cantidad) + ", stock actual:" + producto.cantidad
                flag = false
            }
        }
        return [salida, flag]
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        return error
    }
}

actualizarcantidadproductos = async (formula, cantidad, req) => {
    try {
        for (let i = 0; i < formula.productos.length; i++) {
            const prod = await Producto.findById(formula.productos[i])
            await Producto.findOneAndUpdate({ "_id": formula.productos[i] }, { "cantidad": prod.cantidad - formula.cantidadproducto[i] * Number(cantidad) })
            const producto = await Producto.findById(formula.productos[i])
            const newRegistro = new Registro({
                "idproducto": formula.productos[i], "cantidad": -formula.cantidadproducto[i] * Number(cantidad),
                "idusuario": req.user._id,
                "tipooperacion": "producciòn",
                "detalle": "producciòn",
                "cantidadactual": producto.cantidad

            });
            await newRegistro.save()
        }
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        return error
    }
}

formuCrtrl.crearproducto = async (req, res) => {
    try {
        const msgs = await mensajes.mensajes()
        const { id, cantidad } = req.body
        const formula = await Formula.findOne({ idbalanceado: id }).lean()
        const comprobarcantidad = await controlarcantidad(formula, cantidad)
        if (comprobarcantidad[1]) {
            await actualizarcantidadproductos(formula, cantidad, req)
            const balanceado1 = await Balanceado.findById(id)
            const balanceado = await Balanceado.findOneAndUpdate({ "_id": id }, { "cantidad": balanceado1.cantidad + formula.pesototalproductos * Number(cantidad) })
            const produccion = new Produccion({
                "idproducto": id,
                "cantidad": formula.pesototalproductos * cantidad,
                "cantidadProductos": formula.cantidadproducto,
                "productos": formula.productos,
                "idusuario": req.user._id,
                "costototal": formula.costototal * cantidad
            })
            await produccion.save()
            const newRegistro = new Registro({
                "idproducto": id, "cantidad": cantidad * formula.pesototalproductos,
                "idusuario": req.user._id,
                "tipooperacion": "producciòn",
                "detalle": "producciòn",
                "cantidadactual": balanceado.cantidad
            });
            await newRegistro.save()
            req.flash("success_msg", "producto creado exitosamente")
            res.redirect("/modulos/produccion/crearproducto")
        } else {
            req.flash("success_msg", comprobarcantidad[0])
            res.redirect("/modulos/produccion/crearproducto")
        }
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        res.redirect("/modulos")
    }
}


formuCrtrl.rendercrearproducto = async (req, res) => {
    try {
        const msgs = await mensajes.mensajes()
        const formulas = await Formula.find().populate("idbalanceado").lean()
        const aux = {}
        const producciones = await Produccion.aggregate([
            {
                $group: {
                    _id: {
                        fecha: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        idproducto: "$idproducto"
                    },
                    producciones: { $push: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "balanceados", // Nombre de la colección Balanceado
                    localField: "_id.idproducto",
                    foreignField: "_id",
                    as: "producto"
                }
            },
            {
                $addFields: {
                    producto: { $arrayElemAt: ["$producto", 0] }
                }
            }
        ]);
        producciones.reverse()
        producciones.forEach(ele => {
            if (!(ele._id.fecha in aux)) {
                aux[ele._id.fecha] = {}
                aux[ele._id.fecha].producto = []
                aux[ele._id.fecha].day = ele._id.fecha
            }
            aux[ele._id.fecha].producto.push(ele.producto)
        })

        console.log(aux)

        res.render("moduls/produccion/crearproducto", { "formulas": formulas, "producciones": aux, "mensajes": msgs })
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        res.redirect("/modulos")
    }
}

formuCrtrl.agregarformula = async (req, res) => {
    try {
        const msgs = await mensajes.mensajes()
        const { id, costototalproductos, costototal, totalpesoproductos, cantidad, preciounitario, preciototal, productos, razon, precioadicional } = req.body
        console.log(req.body)
        const formula = await Formula.findOneAndDelete({ "idbalanceado": id }).lean()

        const formulanueva = new Formula({
            "idbalanceado": id,
            "costototalproductos": costototalproductos, "costototal": costototal,
            "pesototalproductos": totalpesoproductos, "cantidadproducto": cantidad,
            "preciosunitarios": preciounitario, "preciototalindividual": preciototal,
            "productos": productos, "idusuario": req.user._id,
            "costosadicionalesrazon": razon, "costosadicionalesmonto": precioadicional
        })
        await formulanueva.save()
        req.flash("success_msg", "Formula agregada exitosamente");
        res.redirect("/modulos/produccion");
    } catch (error) {
        req.flash("error_msg", "Ha ocurrido un error");
        res.redirect("/modulos")
    }
}



module.exports = formuCrtrl