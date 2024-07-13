const { Schema, model } = require("mongoose");

const RegistroSchema = new Schema(
  {
    idproducto: {
      type: Schema.ObjectId, ref: "Producto",
      required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        set: function(value) {
          return parseFloat((Number(value)).toFixed(2));
        }
      },
    idusuario: {
      type: Schema.ObjectId, ref: "User" ,
      required: true,
    },
    tipooperacion: {
      type: String,
        required: true,
    },
    detalle: {
      type: String,
        required: true,
    },
    cantidadactual: {
      type: Number,
        required: true,
    }

  },
  {
    timestamps: true,
  }
);

module.exports = model("Registro", RegistroSchema);
