const { Router } = require("express");
const router = Router();

const {
  renderSignInForm,
  signIn,
  logOut,
  enlistUsers,
  addUser,
  deletUser,
  updateView,
  updateUser,
  redirect,
  addView,
  procesarSolicitud

} = require("../controllers/users.controller");

const { isAuthenticated, isAdmin } = require("../helpers/auth");

router.get("/users/signin",  renderSignInForm);
router.post("/users/signin", signIn);
router.get("/users/logout", logOut);

/*********************/
router.get("/administration", isAuthenticated, enlistUsers);
router.post("/administration/add",isAuthenticated, addUser);
router.get("/administration/add",isAuthenticated, addView);
router.get("/administration/update/:id",isAuthenticated, updateView);
router.put("/administration/update/:id",isAuthenticated, updateUser);
router.post("/modulos/procesarsolicitud",isAuthenticated, procesarSolicitud);
module.exports = router;
