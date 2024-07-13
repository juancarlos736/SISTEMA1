const modulsCtrl = {};
const mensajes = require("../helpers/mensajes");


modulsCtrl.renderInicio = async(req, res) => {
  const msgs = await mensajes.mensajes()
  console.log(msgs)
    res.render("moduls/inicio",{"mensajes":msgs});
  };


module.exports=modulsCtrl



