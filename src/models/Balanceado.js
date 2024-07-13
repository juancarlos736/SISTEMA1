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
    },
    precio: {
      type: Number
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



module.exports = model("Balanceado", UserSchema);
