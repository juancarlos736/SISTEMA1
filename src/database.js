const mongoose= require("mongoose")

const {NOTES_APP_MONGODB_HOST, NOTES_APP_MONGODB_DATABASE, MONGODB_URI} = process.env
const MONGODB_URI=`mongodb+srv://<admin1289>:<adhd8493S89>@cluster0.yn2xhtr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
