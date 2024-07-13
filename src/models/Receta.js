const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    idbalanceado: {
      type: Schema.ObjectId, ref: "Balanceado",
      required: true,
    },
    costototalproductos: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    costototal: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    pesototalproductos: {
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(2));
      }
    },
    cantidadproducto: [{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(4));
      }
    }],
    costosadicionalesrazon: [{
      type: String,
      required: true
    }],
    costosadicionalesmonto: [{
      type: String,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(4));
      }
    }],
    preciosunitarios: [{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(4));
      }
    }],
    preciototalindividual: [{
      type: Number,
      required: true,
      set: function(value) {
        return parseFloat((Number(value)).toFixed(4));
      }
    }],
    productos: [{
      type: Schema.ObjectId,
      ref: 'Producto'
    }],
    idusuario: {
      type: Schema.ObjectId, ref: "User",
      required: true,
    }

  },
  {
    timestamps: true,
  }
);



module.exports = model("Receta", UserSchema);
