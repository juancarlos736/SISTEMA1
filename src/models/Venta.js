const { Schema, model, Types } = require("mongoose");

const VentaSchema = new Schema(
  {
    codigoventa: {
      type: String,
      required: true,
    },
    idcliente: {
      type: Types.ObjectId, ref: "Cliente",
      required: true,
    },
    productos:  [{
      type: String,
      required: true
    }],
    precios: [{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    }],
    totalpro: [{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    }],
    cantidad: [{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    }],
    total: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    subtotal: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    iva: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    detalle: {
      type: String,
      required: true,
    },
    descuento: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    retencion:{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    montoporpagar: {
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

module.exports = model("Venta", VentaSchema);