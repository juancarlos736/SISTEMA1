const usersCtrl = {};
const User = require("../models/User");
const passport = require("passport");
const auth = require("../helpers/auth");
const mensajes = require("../helpers/mensajes");
const Mensaje = require("../models/Mensaje");
const Compra = require("../models/Compra");
const Venta = require("../models/Venta");
const Pago = require("../models/Pago");
const Producto = require("../models/Producto");
const Pagoventa = require("../models/Pagoventa");
const Proveedor = require("../models/Proveedor");
const Cliente = require("../models/Cliente");
//Renderiza el formulario de registro
usersCtrl.renderSignInForm = (req, res) => {
  res.render("users/signin");
};


usersCtrl.signIn = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error_msg", info.message);
      return res.redirect("/users/signin");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/modulos");
    });
  })(req, res, next);
};


usersCtrl.enlistUsers = async (req, res) => {
  try {
    if (auth.isAdmin(req.user.rol)) {
      const users = await User.find().lean();
      const msg = await mensajes.mensajes(); // Corregir la variable a 'mensajes'
      res.render("users/userlist", { users, "mensajes":msg }); // Simplificar la sintaxis del objeto
    } else {
      res.redirect("/modulos");
    }
  } catch (error) {
    console.error("Error al obtener la lista de usuarios:", error); // Agregar un mensaje de error
    res.status(500).send("Error interno del servidor");
  }
};



usersCtrl.logOut = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Ha cerrado sesión exitosamente"); // Corregir el mensaje
    res.redirect("/users/signin");
  });
};


usersCtrl.updateView = async (req, res) => {
  try {
    if (auth.isAdmin(req.user.rol)) {
      const msg = await mensajes.mensajes(); // Cambiar el nombre de la variable a 'mensajes' para mayor claridad
      const user = await User.findById(req.params.id).lean();
      if (!user) {
        return res.status(404).send("Usuario no encontrado"); // Manejar el caso en que el usuario no existe
      }
      res.render("users/editusers", { user, "mensajes":msg }); // Simplificar la sintaxis del objeto
    } else {
      res.redirect("/notes");
    }
  } catch (error) {
    console.error("Error al obtener la vista de actualización:", error);
    res.status(500).send("Error interno del servidor");
  }
};


usersCtrl.addView = async (req, res) => {
  try {
    if (auth.isAdmin(req.user.rol)) {
      const msg = await mensajes.mensajes(); // Cambiar el nombre de la variable a 'mensajes' para mayor claridad
      res.render("users/createusers", { "mensajes":msg }); // Simplificar la sintaxis del objeto
    } else {
      res.redirect("/notes");
    }
  } catch (error) {
    console.error("Error al obtener la vista de creación:", error);
    res.status(500).send("Error interno del servidor");
  }
};








usersCtrl.updateUser = async (req, res) => {
  try { 
    if (auth.isAdmin(req.user.rol)) {
      const errors = [];
      var { name, email, rol, password, confirm_password, estado } = req.body;
      
      if (password != confirm_password) {
        errors.push({ text: "Las contraseñas no coinciden" });
      }
  
      if (password.length < 4) {
        errors.push({ text: "La contraseña debe tener al menos 8 caracteres" });
      }
  
      if (errors.length > 0) {
        const msgs = await mensajes.mensajes()
        res.render("users/editusers", {
          //Devuelve los errores establecidos
          errors,
          name,
          email,
          rol,
          password,
          confirm_password,
          _id, "mensajes": msgs
        });
      } else {
        const emailUser = await User.findOne({ email: email });
  
        if (emailUser && emailUser.id != req.params.id) {
          req.flash("error_msg", "El email ya esta en uso");
          res.redirect("/administration/update/" + req.params.id);
        } else {
          const newUser = new User({
            "name": name,
            "email": email,
            "rol": rol,
            "password": password,
            "state": estado
          });
          const passwordenc = await newUser.encryptPassword(password);
          await User.findByIdAndUpdate(req.params.id, {
            "name": name,
            "email": email,
            "rol": rol,
            "password": passwordenc,
            "state": estado
          })
          req.flash("success_msg", "Usuario actualizado con exito");
          res.redirect("/administration");
        }
      }
    } else {
      res.redirect("/notes")
    }
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res.status(500).send("Error interno del servidor");
  }
  
};
































usersCtrl.addUser = async (req, res) => {
  try {
    if (auth.isAdmin(req.user.rol)) {
      const { name, email, rol, password, confirm_password, state } = req.body;
      const errors = [];

      if (password !== confirm_password) {
        errors.push({ text: "Las contraseñas no coinciden" });
      }

      if (password.length < 8) {
        errors.push({ text: "La contraseña debe contener al menos 8 caracteres" });
      }

      if (errors.length > 0) {
        const msgs = await mensajes.mensajes();
        return res.render("users/userlist", { errors, name, email, rol, state, mensajes: msgs });
      } else {
        const emailUser = await User.findOne({ email });

        if (emailUser) {
          req.flash("error_msg", "El correo ingresado ya está en uso");
          return res.redirect("/administration");
        } else {
          const newUser = new User({ name, email, rol, password, state });
          newUser.password = await newUser.encryptPassword(password);
          await newUser.save();

          req.flash("success_msg", "¡Usuario creado exitosamente!");
          return res.redirect("/administration");
        }
      }
    } else {
      return res.redirect("/modulos");
    }
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    return res.status(500).send("Error interno del servidor");
  }
};







usersCtrl.procesarSolicitud = async (req, res) => {
  try {
    const { respuesta, idelemento, tipoelemento, idmensaje } = req.body;
    const modelos = {
      producto: Producto,
      compra: Compra,
      venta: Venta,
      pagocompra: Pago,
      pagoventa: Pagoventa,
      proveedor: Proveedor,
      cliente: Cliente
    };

    if (respuesta === "aceptar" && modelos[tipoelemento]) {
      await modelos[tipoelemento].findByIdAndUpdate(idelemento, { "editable": 1 });
    }

    await Mensaje.findByIdAndDelete(idmensaje);

    let msgs = await mensajes.mensajes();
    msgs = msgs.map(element => ({
      idproducto: element.idproducto || { _id: "", name: "" },
      idcliente: element.idcliente || { _id: "", name: "" },
      idproveedor: element.idproveedor || { _id: "", name: "" },
      idcompra: element.idcompra || { _id: "", name: "" },
      idventa: element.idventa || { _id: "", name: "" },
      idpagocompra: element.idpagocompra || { _id: "", name: "" },
      idpagoventa: element.idpagoventa || { _id: "", name: "" }
    }));

    res.json({ mensajes: msgs, req: req.body });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
};
























module.exports = usersCtrl;