const msg = {};
const Mensaje = require("../models/Mensaje");


msg.mensajes = async(req,res)=>{
    const msg = await Mensaje.find().lean()
    const mensajes=[]
    for (let i = 0; i < msg.length; i++) {
        if(msg[i].tipoelemento=="producto"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idproducto").lean())
        }
        else if(msg[i].tipoelemento=="proveedor"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idproveedor").lean())
        }
        else if(msg[i].tipoelemento=="cliente"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idcliente").lean())
        }
        else if(msg[i].tipoelemento=="venta"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idventa").lean())
        }
        else if(msg[i].tipoelemento=="compra"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idcompra").lean())
        }
        else if(msg[i].tipoelemento=="pagoventa"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idpagoventa").lean())
        }
        else if(msg[i].tipoelemento=="pagocompra"){
            mensajes.push(await Mensaje.findById(msg[i]._id).populate("idusuario").populate("idpagocompra").lean())
        }
        
    }

    
    mensajes.nummensajes=mensajes.length
    
    return mensajes
}

module.exports = msg;