const { Schema, model,Types } = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(4));
      }
    },
    precio: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    presentacion: {
      type: Number,
      required: true
    },
    presentacionmagnitud: {
      type: String,
      required: true
    }
    ,
    inventario: {
      type: Number,
      required: true
    },
    idproducto: {
      type: Types.ObjectId, ref: "Producto"
    }
    ,
    idproveedor: {
      type: Types.ObjectId, ref: "Proveedor",
      required: true,
    },
    editable: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);



module.exports = model("Producto", UserSchema);
