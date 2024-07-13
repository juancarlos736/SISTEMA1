const { Schema, model } = require("mongoose");

const ProveedorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    deuda:{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
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

module.exports = model("Proveedor", ProveedorSchema);
