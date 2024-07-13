const { Schema, model } = require("mongoose");

const MensajeSchema = new Schema(
  {
    idproducto: {
      type: Schema.ObjectId, ref: "Producto"
    },
    idproveedor: {
      type: Schema.ObjectId, ref: "Proveedor"
    },
    idcliente: {
      type: Schema.ObjectId, ref: "Cliente"
    },
    idventa: {
      type: Schema.ObjectId, ref: "Venta"
    },
    idpagoventa: {
      type: Schema.ObjectId, ref: "Pagoventa"
    },
    idcompra: {
      type: Schema.ObjectId, ref: "Compra"
    },
    idpagocompra: {
      type: Schema.ObjectId, ref: "Pago"
    },
    idusuario: {
      type: Schema.ObjectId, ref: "User" ,
      required: true,
    },
    tipooperacion: {
      type: String,
        required: true,
    },
    tipoelemento: {
      type: String,
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("Mensaje", MensajeSchema);
