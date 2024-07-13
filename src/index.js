require("dotenv").config()
require("./database")
const app = require("./server")


app.listen(app.get("port"),()=>{
    console.log("escuchando en el puerto ", app.get("port"))
})