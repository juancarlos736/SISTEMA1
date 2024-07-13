const { Schema, model } = require("mongoose");

const EntradaSchema = new Schema(
    {
        idproducto: {
          type: Schema.ObjectId, ref: "Producto",
          required: true,
        },
        cantidad: {
            type: Number,
            required: true,
          },
        idusuario: {
          type: Schema.ObjectId, ref: "User" ,
          required: true,
        },
        detalle: {
          type: String,
            required: true,
        }
      },
  {
    timestamps: true,
  }
);

module.exports = model("Entrada", EntradaSchema);
