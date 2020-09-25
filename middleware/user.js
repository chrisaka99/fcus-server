const { verify } = require("jsonwebtoken");

module.exports = {
  validateRegister: (req, res, next) => {
    body = req.body;
    if (!body.user_id || body.user_id.length < 5) {
      res.send({
        msg: "Veuillez entrez au moins 6 caractères",
      });
    }

    if (body.statut === "" || body.statut === undefined) {
      res.send({
        msg: "Veuillez indiquer votre statut",
      });
    }

    if (!body.mdp || body.mdp.length < 5) {
      res.send({
        msg: "Le mot de passe doit avoir au moins 6 caractères",
      });
    }

    if (!body.mdp || body.mdp !== body.remdp) {
      res.send({
        msg: "Les mots de passes doivent concorder",
      });
    }

    if (!body.email) {
      res.send({
        msg: "Entrez une adresse mail",
      });
    } else {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(body.email) === false) {
        return res.send({
          msg: "Entrez une adresse mail valide",
        });
      }
    }

    if (body.statut === "etudiant" && body.prenoms.trim() === "") {
      res.send({
        msg: "Veuillez completer tous les champs",
      });
    }

    next();
  },

  validateAdminRegister: (req, res, next) => {
    body = req.body;

    if (!body.admin_id || body.admin_id.length < 5) {
      res.status(401).send({
        msg: "Veuillez entrez un identifiant d'au moins 6 caractères",
      });
    }

    if (!body.nom) {
      res.status(401).send({
        msg: "Veuillez entrer un nom",
      });
    }

    if (!body.prenoms) {
      res.status(401).send({
        msg: "Veuillez entrer un prenom",
      });
    }

    if (!body.mdp || body.mdp.length < 5) {
      res.status(401).send({
        msg: "Le mot de passe doit avoir au moins 6 caractères",
      });
    }

    if (!body.email) {
      res.status(401).send({
        msg: "Entrez une adresse mail",
      });
    } else {
      const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      console.log(re.test(body.email));
      if (re.test(body.email) === false) {
        return res.status(401).send({
          msg: "Entrez une adresse mail valide",
        });
      }
    }

    next();
  },

  validateQuestion: (req, res, next) => {
    var preo = req.body.re_preo;
    var sugg = req.re_suggest;
    if (preo.trim() === "" || sugg.trim() === "") {
      res.status(401).json({
        msg: "Entrez au moins 6 caractères!",
      });
    }
    next();
  },

  isLoggedIn: (req, res, next) => {
    console.log("ok ok");
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = verify(token, "MEINSEKRET");
      req.userData = decoded;
      next();
    } catch (err) {
      return res.status(401).send({
        msg: "Votre session n'est pas valide!",
      });
    }
  },
};
