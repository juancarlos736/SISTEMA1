const { Schema, model, Types } = require("mongoose");

const ProduccionSchema = new Schema(
  {
    idproducto: {
      type: Types.ObjectId, ref: "Balanceado",
      required: true,
    },
    cantidad: {
        type: Number,
        required: true,
      },
    cantidadProductos: {
      type: Array,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    costototal: {
      type: Array,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    }
    ,
    productos: [{
      type: Types.ObjectId,
      ref: 'Producto'
    }],
    idusuario: {
      type: Types.ObjectId, ref: "User" ,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("Produccion", ProduccionSchema);
