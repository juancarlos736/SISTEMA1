const { Schema, model, Types } = require("mongoose");

const CompraSchema = new Schema(
  {
    tipodepago: {
      type: String,
      required: true,
    },
    venta: {
      type: Types.ObjectId, ref: "Venta",
      required: true,
    },
    monto: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    numerocheque: {
      type: String,
      required: false
    },
    bancocheque: {
      type: String,
      required: false
    },
    numerocuentacheque: {
      type: String,
      required: false
    },
    fechagirocheque: {
      type: String,
      required: false
    },
    tipoefectivo: {
      type: String,
      required: false
    },
    bancoorigentransferencia: {
      type: String,
      required: false
    },
    cuentaorigentransferencia: {
      type: String,
      required: false
    },
    bancodestinotransferencia: {
      type: String,
      required: false
    },
    cuentadestinotransferencia: {
      type: String,
      required: false
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

module.exports = model("Pagoventa", CompraSchema);