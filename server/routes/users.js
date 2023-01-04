const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const config = require("config");
const { User } = require("../models/user");

// Create a new user {Admin, Officier, Maire ou Consulaire}
router.post("/", async (req, res) => {
  // Validate the fields.
  const result = validateNewUser(req.body);
  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  // verify that this user doesn't exist in the database.
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Utilisateur deja existe");

  // create a record and hash the password to enforce security.
  user = new User({ ...req.body });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  // create a JWT and send it in the 'x-auth-token' header.
  const jwtPrivateKey = config.get("jwtPrivateKey");
  const token = jwt.sign(
    {
      matricule: req.body.matricule,
      role: req.body.role,
    },
    jwtPrivateKey
  );
  res.header("x-auth-token", token).send();
});

function validateNewUser(user) {
  const Schema = Joi.object({
    matricule: Joi.string().min(5).max(255).required(),
    email: Joi.string().min(5).max(255).required().email().trim(),
    password: Joi.string().min(5).max(255).required(),
    nom: Joi.string().min(3).max(255).required(),
    prenom: Joi.string().min(3).max(255).required(),
    date_prise_service: Joi.date().required(),
    num_bureau: Joi.string().min(5).max(255),
    pays_de_rattachement: Joi.string().min(5).max(255),
    role: Joi.string().min(5).max(255).required(),
  });

  return Schema.validate(user);
}

module.exports = router;