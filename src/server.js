const express = require("express")
const path = require("path")
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport")
const bodyParser = require('body-parser');


//inicializaciones
const app = express()
require("./config/passport");
//configuraciones
app.set("port", process.env.PORT  || "3000")
app.set("views",path.join(__dirname,"views"))
app.engine(
    ".hbs",
    exphbs.engine({
      defaultLayout: "main",
      layoutsDir: path.join(app.get("views"), "layouts"),
      partialsDir: path.join(app.get("views"), "partials"),
      extname: ".hbs",
      helpers :
  {
  if_equal : function(a, b, opts) {
  if (a == b) {
  return opts.fn(this)
  } else {
  return opts.inverse(this)
  }
  },
  ifIn : function(elem, list, options) {
    if(list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    else {
      return options.inverse(this)
  }
  }
  }
    })
  );
  app.set("view engine", ".hbs");

//middlewares

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//variables globales
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.mensajes = req.mensajes
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    res.locals.isAdmin = req.user && req.user.rol === 'admin';
    next();
  });


//rutas
app.use(require("./routes/index.routes"));
app.use(require("./routes/users.routes"));
app.use(require("./routes/moduls.routes"));
app.use(require("./routes/inventario.routes"));
app.use(require("./routes/formulas.routes"));
app.use(require("./routes/proveedores.routes"))
app.use(require("./routes/clientes.routes"))
app.use(require("./routes/compras.routes"))
app.use(require("./routes/ventas.routes"))
app.use(require("./routes/inventario2.routes"))
app.use(require("./routes/inventario3.routes"))
//archivos estaticos
app.use(express.static(path.join(__dirname,"public")))
















module.exports=app