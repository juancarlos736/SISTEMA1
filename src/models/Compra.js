const { Schema, model, Types } = require("mongoose");

const CompraSchema = new Schema(
  {
    codigocompra: {
      type: String,
      required: true,
    },
    idproveedor: {
      type: Types.ObjectId, ref: "Proveedor",
      required: true,
    },
    productos: [{
      type: Types.ObjectId,
      ref: 'Producto'
    }],
    precios: [{
      type: Number,
      required: true
    }],
    cantidad: [{
      type: Number,
      required: true
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
    detalle: {
      type: String,
      required: true,
    },
    descuento: {
      type: String,
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
    iva:{
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




module.exports = model("Compra", CompraSchema);