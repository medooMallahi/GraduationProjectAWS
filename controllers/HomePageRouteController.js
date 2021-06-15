exports.HomePageRoute = (req, res, next) => {
  return res.status(200).send({ message: "hey !, Wellcome to Miahy" });
};
