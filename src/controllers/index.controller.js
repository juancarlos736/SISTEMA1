const indexCtrl = {};

indexCtrl.renderSignin = (req, res) => {
  res.render("users/signin");
};
module.exports = indexCtrl;
