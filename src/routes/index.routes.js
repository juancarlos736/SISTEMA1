const { Router } = require("express");
const router = Router();

const { renderSignin } = require("../controllers/index.controller");

router.get("/", renderSignin);



module.exports = router;
