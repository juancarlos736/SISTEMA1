const mongoose= require("mongoose")

const {NOTES_APP_MONGODB_HOST, NOTES_APP_MONGODB_DATABASE, MONGODB_URI} = process.env

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });