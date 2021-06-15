exports.HomePageRoute = (req, res, next) => {
  return res.status(200).send({ message: "Wellcome to Miahy" });
};
