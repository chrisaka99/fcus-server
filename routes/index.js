require("dotenv").config();
var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/mysql");
const mailer = require("nodemailer");

var transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: "akachris225@gmail.com",
    pass: "Lareussite01",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const {
  validateRegister,
  isLoggedIn,
  validateAdminRegister,
  validateQuestion,
} = require("../middleware/user");

//?::::::::::::::::::::::::::::::::::::: USER ROUTES ::::::::::::::::::::::::::::::::::::::::::::://

router.post("/login", function (req, res, next) {
  db.query(
    "SELECT * FROM user WHERE user_id = ?;",
    [req.body.user_id],
    (error, result) => {
      if (error) {
        // throw error;
        return res.send({
          msg: error,
        });
      }

      if (!result.length) {
        // console.log("ERR");
        return res.status(401).send({
          msg: "Identifiant ou Mot de passe incorrect",
        });
      }

      // console.log(req.body.mdp);
      bcrypt.compare(req.body.mdp, result[0].mdp, (bError, bResult) => {
        if (bError) {
          // throw bError;
          return res.send({
            msg: bError,
          });
        }
        // console.log(bResult);
        if (bResult) {
          const token = jwt.sign(
            {
              id: result[0].id,
              user_id: result[0].user_id,
              // mdp: result[0].mdp,
              email: result[0].email,
              inscrit: result[0].inscrit,
              statut: result[0].statut,
              nom: result[0].nom,
              prenoms: result[0].prenoms,
              dateNais: result[0].dateNais,
              sexe: result[0].sexe,
              promotion: result[0].promotion,
            },
            "MEINSEKRET",
            { expiresIn: "7d" }
          );

          // db.query("UPDATE user SET last_login = now() WHERE user_id = ?", [
          //   result.user_id,
          // ]);
          return res.status(200).send({
            msg: "Utilisateur connecté",
            token,
            user: result[0],
          });
        }

        return res.status(401).send({
          msg: "L'identifiant ou le Mot de passe est incorrect",
        });
      });
    }
  );
});

router.post("/register", validateRegister, function (req, res, next) {
  //? ON VERIFIE D'ABORD SI L'IDENTIFIANT EXISTE DANS LA DATABASE
  db.query(
    "SELECT * FROM user WHERE LOWER(user_id) = LOWER(?);",
    [req.body.user_id],
    (error, result) => {
      if (result.length) {
        return res.status(401).send({
          msg: "L'identifiant existe déjà.",
        });
      } else {
        console.log("A");
        //? ALORS ON ENREGISTRE UN NOUVEL UTILISATEUR
        bcrypt.hash(req.body.mdp, 10, (err, hash) => {
          if (err) {
            return res.send({
              msg: err,
            });
          } else {
            console.log("B");
            if (req.body.statut === "client") {
              console.log("C");
              db.query(
                "INSERT INTO user(user_id, mdp, email, inscrit, statut, nom, prenoms, dateNais, sexe, promotion, prestation) VALUES (?,?,?,now(),?,?, NULL, NULL, NULL, NULL, ?);",
                [
                  req.body.user_id,
                  hash,
                  req.body.email,
                  req.body.statut,
                  req.body.nom,
                  req.body.prestations[0],
                ],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.send({
                      msg: err,
                    });
                  }
                  if (result) {
                    console.log(result);
                    // console.log("D");
                    var tab = req.body.prestations;
                    var id_client = req.body.user_id;
                    console.log(req.body.prestations);
                    for (i = 0; i < tab.length; i++) {
                      db.query(
                        "INSERT INTO prestation(libelle, id_client) VALUES (?,?)",
                        [tab[i], id_client],
                        (err, result) => {
                          if (err) {
                            return res.send({
                              msg: err,
                            });
                          }
                          if (result) {
                            var tab2 = req.body.prestations;
                            var id_client2 = req.body.user_id;
                            for (j = 0; j < tab2.length; j++) {
                              db.query(
                                "INSERT INTO activite(libelle, id_client) VALUES (?,?)",
                                [tab2[j], id_client2],
                                (err, result) => {
                                  if (err) {
                                    return res.send({
                                      msg: err,
                                    });
                                  }
                                }
                              );
                            }
                          }
                        }
                      );
                    }
                    var mailOptions = {
                      from: "akachris225@gmail.com",
                      to: "kevin.kouadio.1998@gmail.com",
                      subject: "Identifiants de connexion",
                      html: `<!DOCTYPE html>
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width" />
                          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                          <title>Simple Transactional Email</title>
                          <style>
                            /* -------------------------------------
                                GLOBAL RESETS
                            ------------------------------------- */
                      
                            /*All the styling goes here*/
                      
                            img {
                              border: none;
                              -ms-interpolation-mode: bicubic;
                              max-width: 100%;
                            }
                      
                            body {
                              background-color: #f6f6f6;
                              font-family: sans-serif;
                              -webkit-font-smoothing: antialiased;
                              font-size: 14px;
                              line-height: 1.4;
                              margin: 0;
                              padding: 0;
                              -ms-text-size-adjust: 100%;
                              -webkit-text-size-adjust: 100%;
                            }
                      
                            table {
                              border-collapse: separate;
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              width: 100%;
                            }
                            table td {
                              font-family: sans-serif;
                              font-size: 14px;
                              vertical-align: top;
                            }
                      
                            /* -------------------------------------
                                BODY & CONTAINER
                            ------------------------------------- */
                      
                            .body {
                              background-color: #f6f6f6;
                              width: 100%;
                            }
                      
                            /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                            .container {
                              display: block;
                              margin: 0 auto !important;
                              /* makes it centered */
                              max-width: 580px;
                              padding: 10px;
                              width: 580px;
                            }
                      
                            /* This should also be a block element, so that it will fill 100% of the .container */
                            .content {
                              box-sizing: border-box;
                              display: block;
                              margin: 0 auto;
                              max-width: 580px;
                              padding: 10px;
                            }
                      
                            /* -------------------------------------
                                HEADER, FOOTER, MAIN
                            ------------------------------------- */
                            .main {
                              background: #ffffff;
                              border-radius: 3px;
                              width: 100%;
                            }
                      
                            .wrapper {
                              box-sizing: border-box;
                              padding: 20px;
                            }
                      
                            .content-block {
                              padding-bottom: 10px;
                              padding-top: 10px;
                            }
                      
                            .footer {
                              clear: both;
                              margin-top: 10px;
                              text-align: center;
                              width: 100%;
                            }
                            .footer td,
                            .footer p,
                            .footer span,
                            .footer a {
                              color: #999999;
                              font-size: 12px;
                              text-align: center;
                            }
                      
                            /* -------------------------------------
                                TYPOGRAPHY
                            ------------------------------------- */
                            h1,
                            h2,
                            h3,
                            h4 {
                              color: #000000;
                              font-family: sans-serif;
                              font-weight: 400;
                              line-height: 1.4;
                              margin: 0;
                              margin-bottom: 30px;
                            }
                      
                            h1 {
                              font-size: 35px;
                              font-weight: 300;
                              text-align: center;
                              text-transform: capitalize;
                            }
                      
                            p,
                            ul,
                            ol {
                              font-family: sans-serif;
                              font-size: 14px;
                              font-weight: normal;
                              margin: 0;
                              margin-bottom: 15px;
                            }
                            p li,
                            ul li,
                            ol li {
                              list-style-position: inside;
                              margin-left: 5px;
                            }
                      
                            a {
                              color: #3498db;
                              text-decoration: underline;
                            }
                      
                            /* -------------------------------------
                                BUTTONS
                            ------------------------------------- */
                            .btn {
                              box-sizing: border-box;
                              width: 100%;
                            }
                            .btn > tbody > tr > td {
                              padding-bottom: 15px;
                            }
                            .btn table {
                              width: auto;
                            }
                            .btn table td {
                              background-color: #ffffff;
                              border-radius: 5px;
                              text-align: center;
                            }
                            .btn a {
                              background-color: #ffffff;
                              border: solid 1px #3498db;
                              border-radius: 5px;
                              box-sizing: border-box;
                              color: #3498db;
                              cursor: pointer;
                              display: inline-block;
                              font-size: 14px;
                              font-weight: bold;
                              margin: 0;
                              padding: 12px 25px;
                              text-decoration: none;
                              text-transform: capitalize;
                            }
                      
                            .btn-primary table td {
                              background-color: #3498db;
                            }
                      
                            .btn-primary a {
                              background-color: #3498db;
                              border-color: #3498db;
                              color: #ffffff;
                            }
                      
                            /* -------------------------------------
                                OTHER STYLES THAT MIGHT BE USEFUL
                            ------------------------------------- */
                            .last {
                              margin-bottom: 0;
                            }
                      
                            .first {
                              margin-top: 0;
                            }
                      
                            .align-center {
                              text-align: center;
                            }
                      
                            .align-right {
                              text-align: right;
                            }
                      
                            .align-left {
                              text-align: left;
                            }
                      
                            .clear {
                              clear: both;
                            }
                      
                            .mt0 {
                              margin-top: 0;
                            }
                      
                            .mb0 {
                              margin-bottom: 0;
                            }
                      
                            .preheader {
                              color: transparent;
                              display: none;
                              height: 0;
                              max-height: 0;
                              max-width: 0;
                              opacity: 0;
                              overflow: hidden;
                              mso-hide: all;
                              visibility: hidden;
                              width: 0;
                            }
                      
                            .powered-by a {
                              text-decoration: none;
                            }
                      
                            hr {
                              border: 0;
                              border-bottom: 1px solid #f6f6f6;
                              margin: 20px 0;
                            }
                      
                            /* -------------------------------------
                                RESPONSIVE AND MOBILE FRIENDLY STYLES
                            ------------------------------------- */
                            @media only screen and (max-width: 620px) {
                              table[class="body"] h1 {
                                font-size: 28px !important;
                                margin-bottom: 10px !important;
                              }
                              table[class="body"] p,
                              table[class="body"] ul,
                              table[class="body"] ol,
                              table[class="body"] td,
                              table[class="body"] span,
                              table[class="body"] a {
                                font-size: 16px !important;
                              }
                              table[class="body"] .wrapper,
                              table[class="body"] .article {
                                padding: 10px !important;
                              }
                              table[class="body"] .content {
                                padding: 0 !important;
                              }
                              table[class="body"] .container {
                                padding: 0 !important;
                                width: 100% !important;
                              }
                              table[class="body"] .main {
                                border-left-width: 0 !important;
                                border-radius: 0 !important;
                                border-right-width: 0 !important;
                              }
                              table[class="body"] .btn table {
                                width: 100% !important;
                              }
                              table[class="body"] .btn a {
                                width: 100% !important;
                              }
                              table[class="body"] .img-responsive {
                                height: auto !important;
                                max-width: 100% !important;
                                width: auto !important;
                              }
                            }
                      
                            /* -------------------------------------
                                PRESERVE THESE STYLES IN THE HEAD
                            ------------------------------------- */
                            @media all {
                              .ExternalClass {
                                width: 100%;
                              }
                              .ExternalClass,
                              .ExternalClass p,
                              .ExternalClass span,
                              .ExternalClass font,
                              .ExternalClass td,
                              .ExternalClass div {
                                line-height: 100%;
                              }
                              .apple-link a {
                                color: inherit !important;
                                font-family: inherit !important;
                                font-size: inherit !important;
                                font-weight: inherit !important;
                                line-height: inherit !important;
                                text-decoration: none !important;
                              }
                              #MessageViewBody a {
                                color: inherit;
                                text-decoration: none;
                                font-size: inherit;
                                font-family: inherit;
                                font-weight: inherit;
                                line-height: inherit;
                              }
                              .btn-primary table td:hover {
                                background-color: #34495e !important;
                              }
                              .btn-primary a:hover {
                                background-color: #34495e !important;
                                border-color: #34495e !important;
                              }
                            }
                          </style>
                        </head>
                        <body class="">
                          <span class="preheader"
                            >This is preheader text. Some clients will show this text as a
                            preview.</span
                          >
                          <table
                            role="presentation"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            class="body"
                          >
                            <tr>
                              <td>&nbsp;</td>
                              <td class="container">
                                <div class="content">
                                  <!-- START CENTERED WHITE CONTAINER -->
                                  <table role="presentation" class="main">
                                    <!-- START MAIN CONTENT AREA -->
                                    <tr>
                                      <td class="wrapper">
                                        <table
                                          role="presentation"
                                          border="0"
                                          cellpadding="0"
                                          cellspacing="0"
                                        >
                                          <tr>
                                            <td>
                                              <p>Bonjour cher client,</p>
                                              <p>
                                                Nous sollicitons, par ce présent mail, votre attention
                                                pour donner votre avis sur nos services via notre
                                                plateforme.<br/> En effet, un compte à été spécialement créé
                                                pour permettre cela. Ce mail a donc pour but de vous
                                                communiquer vos identifiants de connexion.
                                              </p>
                      
                                              <p>Identifiant: ${req.body.user_id}</p>
                                              <p>Mot de passe: ${req.body.mdp}</p>
                                              <table
                                                role="presentation"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                class="btn btn-primary"
                                              >
                                                <tbody>
                                                  <tr>
                                                    <td align="center">
                                                      <table
                                                        role="presentation"
                                                        border="0"
                                                        cellpadding="0"
                                                        cellspacing="0"
                                                      >
                                                        <tbody>
                                                          <tr>
                                                            <td>
                                                              <a
                                                                href="http://localhost:8080/connexion"
                                                                target="_blank"
                                                                >Se connecter</a
                                                              >
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                      
                                    <!-- END MAIN CONTENT AREA -->
                                  </table>
                                  <!-- END CENTERED WHITE CONTAINER -->
                      
                                  <!-- START FOOTER -->
                                  <div class="footer">
                                    <table
                                      role="presentation"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                    >
                                      <tr>
                                        <td class="content-block">
                                          <span class="apple-link"
                                            >Groupe KOMPTECH-CIMAT <br />
                                            Marcory Boulevard VGE en face de CAP SUD. <br />
                                            Abidjan, Côte d'Ivoire</span
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                  <!-- END FOOTER -->
                                </div>
                              </td>
                              <td>&nbsp;</td>
                            </tr>
                          </table>
                        </body>
                      </html>
                      `,
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log("Email sent " + info.response);
                      }
                    });
                    return res.status(200).send({
                      msg: "Compte créé!",
                    });
                  }
                }
              );
            } else if (req.body.statut === "etudiant") {
              db.query(
                "INSERT INTO user(user_id, mdp, email, inscrit, statut, nom, prenoms, dateNais, sexe, promotion) VALUES (?,?,?,now(),?,?,?,?,?,?);",
                [
                  req.body.user_id,
                  hash,
                  req.body.email,
                  req.body.statut,
                  req.body.nom,
                  req.body.prenoms,
                  req.body.dateNais,
                  req.body.sexe,
                  req.body.promotion,
                ],
                (err, result) => {
                  // console.log(result);
                  if (err) {
                    // throw err;
                    return res.send({
                      msg: err,
                    });
                  }
                  if (result) {
                    var tab = req.body.formations;
                    var id_etu = req.body.user_id;
                    for (i = 0; i < tab.length; i++) {
                      db.query(
                        "INSERT INTO formation(libelle_formation, etu_id) VALUES (?,?)",
                        [tab[i], id_etu],
                        (err, result) => {
                          if (err) {
                            return res.send({
                              msg: err,
                            });
                          }
                        }
                      );
                    }
                  }

                  var mailOptions = {
                    from: "akachris225@gmail.com",
                    to: "kevin.kouadio.1998@gmail.com",
                    subject: "Identifiants de connexion",
                    html: `<!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width" />
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <title>Simple Transactional Email</title>
                        <style>
                          /* -------------------------------------
                              GLOBAL RESETS
                          ------------------------------------- */
                    
                          /*All the styling goes here*/
                    
                          img {
                            border: none;
                            -ms-interpolation-mode: bicubic;
                            max-width: 100%;
                          }
                    
                          body {
                            background-color: #f6f6f6;
                            font-family: sans-serif;
                            -webkit-font-smoothing: antialiased;
                            font-size: 14px;
                            line-height: 1.4;
                            margin: 0;
                            padding: 0;
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
                          }
                    
                          table {
                            border-collapse: separate;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            width: 100%;
                          }
                          table td {
                            font-family: sans-serif;
                            font-size: 14px;
                            vertical-align: top;
                          }
                    
                          /* -------------------------------------
                              BODY & CONTAINER
                          ------------------------------------- */
                    
                          .body {
                            background-color: #f6f6f6;
                            width: 100%;
                          }
                    
                          /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                          .container {
                            display: block;
                            margin: 0 auto !important;
                            /* makes it centered */
                            max-width: 580px;
                            padding: 10px;
                            width: 580px;
                          }
                    
                          /* This should also be a block element, so that it will fill 100% of the .container */
                          .content {
                            box-sizing: border-box;
                            display: block;
                            margin: 0 auto;
                            max-width: 580px;
                            padding: 10px;
                          }
                    
                          /* -------------------------------------
                              HEADER, FOOTER, MAIN
                          ------------------------------------- */
                          .main {
                            background: #ffffff;
                            border-radius: 3px;
                            width: 100%;
                          }
                    
                          .wrapper {
                            box-sizing: border-box;
                            padding: 20px;
                          }
                    
                          .content-block {
                            padding-bottom: 10px;
                            padding-top: 10px;
                          }
                    
                          .footer {
                            clear: both;
                            margin-top: 10px;
                            text-align: center;
                            width: 100%;
                          }
                          .footer td,
                          .footer p,
                          .footer span,
                          .footer a {
                            color: #999999;
                            font-size: 12px;
                            text-align: center;
                          }
                    
                          /* -------------------------------------
                              TYPOGRAPHY
                          ------------------------------------- */
                          h1,
                          h2,
                          h3,
                          h4 {
                            color: #000000;
                            font-family: sans-serif;
                            font-weight: 400;
                            line-height: 1.4;
                            margin: 0;
                            margin-bottom: 30px;
                          }
                    
                          h1 {
                            font-size: 35px;
                            font-weight: 300;
                            text-align: center;
                            text-transform: capitalize;
                          }
                    
                          p,
                          ul,
                          ol {
                            font-family: sans-serif;
                            font-size: 14px;
                            font-weight: normal;
                            margin: 0;
                            margin-bottom: 15px;
                          }
                          p li,
                          ul li,
                          ol li {
                            list-style-position: inside;
                            margin-left: 5px;
                          }
                    
                          a {
                            color: #3498db;
                            text-decoration: underline;
                          }
                    
                          /* -------------------------------------
                              BUTTONS
                          ------------------------------------- */
                          .btn {
                            box-sizing: border-box;
                            width: 100%;
                          }
                          .btn > tbody > tr > td {
                            padding-bottom: 15px;
                          }
                          .btn table {
                            width: auto;
                          }
                          .btn table td {
                            background-color: #ffffff;
                            border-radius: 5px;
                            text-align: center;
                          }
                          .btn a {
                            background-color: #ffffff;
                            border: solid 1px #3498db;
                            border-radius: 5px;
                            box-sizing: border-box;
                            color: #3498db;
                            cursor: pointer;
                            display: inline-block;
                            font-size: 14px;
                            font-weight: bold;
                            margin: 0;
                            padding: 12px 25px;
                            text-decoration: none;
                            text-transform: capitalize;
                          }
                    
                          .btn-primary table td {
                            background-color: #3498db;
                          }
                    
                          .btn-primary a {
                            background-color: #3498db;
                            border-color: #3498db;
                            color: #ffffff;
                          }
                    
                          /* -------------------------------------
                              OTHER STYLES THAT MIGHT BE USEFUL
                          ------------------------------------- */
                          .last {
                            margin-bottom: 0;
                          }
                    
                          .first {
                            margin-top: 0;
                          }
                    
                          .align-center {
                            text-align: center;
                          }
                    
                          .align-right {
                            text-align: right;
                          }
                    
                          .align-left {
                            text-align: left;
                          }
                    
                          .clear {
                            clear: both;
                          }
                    
                          .mt0 {
                            margin-top: 0;
                          }
                    
                          .mb0 {
                            margin-bottom: 0;
                          }
                    
                          .preheader {
                            color: transparent;
                            display: none;
                            height: 0;
                            max-height: 0;
                            max-width: 0;
                            opacity: 0;
                            overflow: hidden;
                            mso-hide: all;
                            visibility: hidden;
                            width: 0;
                          }
                    
                          .powered-by a {
                            text-decoration: none;
                          }
                    
                          hr {
                            border: 0;
                            border-bottom: 1px solid #f6f6f6;
                            margin: 20px 0;
                          }
                    
                          /* -------------------------------------
                              RESPONSIVE AND MOBILE FRIENDLY STYLES
                          ------------------------------------- */
                          @media only screen and (max-width: 620px) {
                            table[class="body"] h1 {
                              font-size: 28px !important;
                              margin-bottom: 10px !important;
                            }
                            table[class="body"] p,
                            table[class="body"] ul,
                            table[class="body"] ol,
                            table[class="body"] td,
                            table[class="body"] span,
                            table[class="body"] a {
                              font-size: 16px !important;
                            }
                            table[class="body"] .wrapper,
                            table[class="body"] .article {
                              padding: 10px !important;
                            }
                            table[class="body"] .content {
                              padding: 0 !important;
                            }
                            table[class="body"] .container {
                              padding: 0 !important;
                              width: 100% !important;
                            }
                            table[class="body"] .main {
                              border-left-width: 0 !important;
                              border-radius: 0 !important;
                              border-right-width: 0 !important;
                            }
                            table[class="body"] .btn table {
                              width: 100% !important;
                            }
                            table[class="body"] .btn a {
                              width: 100% !important;
                            }
                            table[class="body"] .img-responsive {
                              height: auto !important;
                              max-width: 100% !important;
                              width: auto !important;
                            }
                          }
                    
                          /* -------------------------------------
                              PRESERVE THESE STYLES IN THE HEAD
                          ------------------------------------- */
                          @media all {
                            .ExternalClass {
                              width: 100%;
                            }
                            .ExternalClass,
                            .ExternalClass p,
                            .ExternalClass span,
                            .ExternalClass font,
                            .ExternalClass td,
                            .ExternalClass div {
                              line-height: 100%;
                            }
                            .apple-link a {
                              color: inherit !important;
                              font-family: inherit !important;
                              font-size: inherit !important;
                              font-weight: inherit !important;
                              line-height: inherit !important;
                              text-decoration: none !important;
                            }
                            #MessageViewBody a {
                              color: inherit;
                              text-decoration: none;
                              font-size: inherit;
                              font-family: inherit;
                              font-weight: inherit;
                              line-height: inherit;
                            }
                            .btn-primary table td:hover {
                              background-color: #34495e !important;
                            }
                            .btn-primary a:hover {
                              background-color: #34495e !important;
                              border-color: #34495e !important;
                            }
                          }
                        </style>
                      </head>
                      <body class="">
                        <span class="preheader"
                          >This is preheader text. Some clients will show this text as a
                          preview.</span
                        >
                        <table
                          role="presentation"
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          class="body"
                        >
                          <tr>
                            <td>&nbsp;</td>
                            <td class="container">
                              <div class="content">
                                <!-- START CENTERED WHITE CONTAINER -->
                                <table role="presentation" class="main">
                                  <!-- START MAIN CONTENT AREA -->
                                  <tr>
                                    <td class="wrapper">
                                      <table
                                        role="presentation"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                      >
                                        <tr>
                                          <td>
                                            <p>Bonjour cher client,</p>
                                            <p>
                                              Nous sollicitons, par ce présent mail, votre attention
                                              pour donner votre avis sur nos services via notre
                                              plateforme.<br/> En effet, un compte à été spécialement créé
                                              pour permettre cela. Ce mail a donc pour but de vous
                                              communiquer vos identifiants de connexion.
                                            </p>
                    
                                            <p>Identifiant: ${req.body.user_id}</p>
                                            <p>Mot de passe: ${req.body.mdp}</p>
                                            <table
                                              role="presentation"
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              class="btn btn-primary"
                                            >
                                              <tbody>
                                                <tr>
                                                  <td align="center">
                                                    <table
                                                      role="presentation"
                                                      border="0"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                    >
                                                      <tbody>
                                                        <tr>
                                                          <td>
                                                            <a
                                                              href="http://localhost:8080/connexion"
                                                              target="_blank"
                                                              >Se connecter</a
                                                            >
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                    
                                  <!-- END MAIN CONTENT AREA -->
                                </table>
                                <!-- END CENTERED WHITE CONTAINER -->
                    
                                <!-- START FOOTER -->
                                <div class="footer">
                                  <table
                                    role="presentation"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                  >
                                    <tr>
                                      <td class="content-block">
                                        <span class="apple-link"
                                          >Groupe KOMPTECH-CIMAT <br />
                                          Marcory Boulevard VGE en face de CAP SUD. <br />
                                          Abidjan, Côte d'Ivoire</span
                                        >
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                                <!-- END FOOTER -->
                              </div>
                            </td>
                            <td>&nbsp;</td>
                          </tr>
                        </table>
                      </body>
                    </html>
                    `,
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log("Email sent " + info.response);
                    }
                  });
                  return res.status(200).send({
                    msg: "Compte créé!",
                  });
                }
              );
            }
          }
        });
      }
    }
  );
});

router.get("/user", (req, res, next) => {
  let token = req.headers.token;
  jwt.verify(token, "MEINSEKRET", (err, decode) => {
    // console.log(decode);
    if (err) {
      return res.json({
        title: "Non autorisé",
      });
    }
    return res.json({
      id: decode.id,
      user_id: decode.user_id,
      mdp: decode.mdp,
      nom: decode.nom,
      remdp: decode.remdp,
      email: decode.email,
      statut: decode.statut,
      prenom: decode.prenoms,
      dateNais: decode.dateNais,
      sexe: decode.sexe,
      promotion: decode.promotion,
    });
    // console.log(decode.nom);
  });
});

router.get("/secret-route", isLoggedIn, function (req, res, next) {
  // console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

//?::::::::::::::::::::::::::::::::::::: FONCTIONNALITY ROUTES ::::::::::::::::::::::::::::::::::::://

router.post("/preoccupation", (req, res, next) => {
  // console.log(req.body);
  db.query(
    "SELECT id FROM user WHERE user_id = ?",
    [req.body.user_id],
    (err, result) => {
      if (err) return res.json({ msg: "Erreur de soumission" });
      if (result) {
        // console.log(result[0].id);
        db.query(
          "INSERT INTO preoccupation(service, text, id_user) VALUES(?,?,?)",
          [req.body.service, req.body.text, result[0].id],
          (err, result1) => {
            if (err) return res.json({ msg: "Erreur de soumission" });
            if (result1) return res.json({ msg: "Préoccupation soumise !" });
          }
        );
      }
    }
  );
});

router.get("/list_preo/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  db.query(
    "SELECT * FROM preoccupation WHERE id_user = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res
          .status(200)
          .json({ msg: "preoccupation list got", list: result });
      }
    }
  );
});

router.post("/suggestions", (req, res, next) => {
  // console.log(req.body);
  db.query(
    "SELECT id FROM user WHERE user_id = ?",
    [req.body.user_id],
    (err, result) => {
      if (err) return res.json({ msg: "Erreur de soumission" });
      if (result) {
        // console.log(result);
        db.query(
          "INSERT INTO suggestions(service, text, id_user) VALUES(?,?,?)",
          [req.body.service, req.body.text, result[0].id],
          (err, result1) => {
            if (err) return res.json({ msg: "Erreur de soumission" });
            if (result1) return res.json({ msg: "Suggestion soumise !" });
          }
        );
      }
    }
  );
});

router.get("/suggest/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  db.query(
    "SELECT * FROM suggestions WHERE id_user = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        // console.log(result);
        return res
          .status(200)
          .json({ msg: "suggestions list got", list: result });
      }
    }
  );
});

router.post("/rate_invest", (req, res, next) => {
  db.query(
    "INSERT INTO question (note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      req.body.val1,
      req.body.val2,
      req.body.val3,
      req.body.val4,
      req.body.val5,
      req.body.val6,
      req.body.val7,
      req.body.val8,
      req.body.val9,
      req.body.val10,
      req.body.val11,
      req.body.val12,
      req.body.val3,
      req.body.val14,
      req.body.val15,
    ]
  );
});

router.get("/formation/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  db.query("SELECT * FROM formation WHERE etu_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(401).json({ msg: err });
    }
    if (result) {
      return res.status(200).json({ msg: "formation list got", list: result });
    }
  });
});

router.post("/formation", (req, res, next) => {
  let id = req.body.id;
  let note = req.body.note;
  console.log(id);
  console.log(note);
  db.query(
    "INSERT INTO formation(libelle_formation) VALUES(?) WHERE etu_id = ?",
    [note, id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res
          .status(200)
          .json({ msg: "Formations évaluées", list: result });
      }
    }
  );
});

router.get("/prestation/:id", (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  db.query(
    "SELECT * FROM prestation WHERE id_client = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res
          .status(200)
          .json({ msg: "prestation list got", list: result });
      }
    }
  );
});
router.post("/prestation", (req, res, next) => {
  let id = req.body.id;
  let note = req.body.note;
  console.log(id);
  console.log(note);
  db.query(
    "INSERT INTO prestation(libelle) VALUES(?) WHERE id_client = ?",
    [note, id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res
          .status(200)
          .json({ msg: "Prestations evaluées", list: result });
      }
    }
  );
});

//?::::::::::::::::::::::::::::::::::::: ADMIN ROUTES ::::::::::::::::::::::::::::::::::::://

router.post("/addAdmin", validateAdminRegister, (req, res, next) => {
  db.query(
    "SELECT * FROM admin WHERE LOWER(admin_id) = LOWER(?);",
    [req.body.admin_id],
    (error, result) => {
      if (result.length) {
        return res.status(401).send({
          msg: "L'identifiant existe déjà.",
        });
      } else {
        //? ALORS ON ENREGISTRE UN NOUVEL ADMIN
        bcrypt.hash(req.body.mdp, 10, (err, hash) => {
          if (err) {
            return res.send({
              msg: err,
            });
          } else {
            db.query(
              "INSERT INTO admin(admin_id, mdp, nom, prenoms, email) VALUES (?,?,?,?,?);",
              [
                req.body.admin_id,
                hash,
                req.body.nom,
                req.body.prenoms,
                req.body.email,
              ],
              (err, result) => {
                if (err) {
                  // console.log(result);
                  // throw err;
                  return res.status(401).send({
                    msg: err,
                  });
                }
                return res.status(200).send({
                  msg: "Admin créé!",
                });
              }
            );
          }
        });
      }
    }
  );
});

router.post("/loginAdmin", function (req, res, next) {
  db.query(
    "SELECT * FROM admin WHERE admin_id = ?;",
    [req.body.admin_id],
    (error, result) => {
      if (error) {
        // throw error;
        return res.send({
          msg: error,
        });
      }

      if (!result.length) {
        // console.log("ERR");
        return res.status(401).send({
          msg: "Identifiant ou Mot de passe incorrect",
        });
      }

      // console.log(req.body.mdp);
      bcrypt.compare(req.body.mdp, result[0].mdp, (bError, bResult) => {
        if (bError) {
          // throw bError;
          return res.send({
            msg: bError,
          });
        }

        if (bResult) {
          const tokenAdmin = jwt.sign(
            {
              admin_id: result[0].admin_id,
              mdp: result[0].mdp,
              nom: result[0].nom,
              prenom: result[0].mdp,
              email: result[0].email,
              id: result[0].id,
            },
            "MEINSEKRET1",
            { expiresIn: "7d" }
          );

          // console.log(result[0]);
          return res.status(200).send({
            msg: "Admin connecté",
            tokenAdmin,
            user: result[0],
          });
        }

        return res.status(401).send({
          msg: "L'identifiant ou le Mot de passe est incorrect",
        });
      });
    }
  );
});

router.get("/admin", (req, res, next) => {
  let tokenAdmin = req.headers.token;
  // console.log(tokenAdmin);
  jwt.verify(tokenAdmin, "MEINSEKRET1", (err, decode) => {
    // console.log(decode);
    if (err) {
      return res.json({
        msg: "Non autorisé",
      });
    }
    // console.log("okok");
    return res.json({
      msg: "Connecté",
      admin_id: decode.admin_id,
      nom: decode.nom,
      prenoms: decode.prenoms,
      email: decode.email,
      mdp: decode.mdp,
      id: decode.id,
    });
  });
});

router.get("/preo", (req, res, next) => {
  db.query(
    "SELECT preoccupation.id_user, preoccupation.service, preoccupation.text, user.nom, user.prenoms, user.statut FROM preoccupation INNER JOIN user ON preoccupation.id_user = user.id",
    (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: "Erreur",
          erreur: err,
        });
      }

      if (result) {
        // console.log(result);
        return res.status(200).json({
          msg: "succès",
          listpreo: result,
        });
      }
    }
  );
});

router.get("/list-users", (req, res, next) => {
  db.query("SELECT * FROM user", (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: "Erreur",
        erreur: err,
      });
    }

    if (result) {
      for (i = 0; i < result.length; i++) {
        result[i].prenoms
          ? (result[i].fullname = result[i].nom + " " + result[i].prenoms)
          : (result[i].fullname = result[i].nom);
      }
      // console.log(result);
      return res.status(200).json({
        msg: "liste users receuillie",
        listusers: result,
      });
    }
  });
});

router.get("/list-admin", (req, res, next) => {
  db.query("SELECT * FROM admin", (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: "Erreur",
        erreur: err,
      });
    }

    if (result) {
      for (i = 0; i < result.length; i++) {
        result[i].prenoms
          ? (result[i].fullname = result[i].nom + " " + result[i].prenoms)
          : (result[i].fullname = result[i].nom);
        result[i].statut = "Administrateur";
      }
      // console.log(result);
      return res.status(200).json({
        msg: "liste admin receuillie",
        listadmin: result,
      });
    }
  });
});

router.post("/question", validateQuestion, (req, res, next) => {
  db.query(
    "INSERT INTO question(content, id_admin) VALUES(?, ?)",
    [req.body.content, req.body.id_admin],
    (err, result) => {
      if (err) {
        return res.send({
          msg: err,
        });
      }

      if (result) {
        // console.log(result);
        return res.status(200).send({
          msg: "Question ajoutée",
        });
      }
    }
  );
});

router.get("/question", (req, res, next) => {
  db.query("SELECT * FROM question", (err, result) => {
    if (err) {
      return res.status(401).json({ msg: err });
    }
    if (result) {
      return res.status(200).json({ msg: "QUESTIONS LIST GOT!", list: result });
    }
  });
});

router.get("/question/:id", (req, res, next) => {
  db.query(
    "SELECT * FROM question WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res
          .status(200)
          .json({ msg: "QUESTIONS LIST GOT!", list: result });
      }
    }
  );
});

router.post("/questionVue", (req, res, next) => {
  db.query(
    "SELECT DISTINCT reponses.content, user.nom, user.prenoms, user.statut FROM reponses INNER JOIN question ON reponses.id_question = ? INNER JOIN user ON user.id = reponses.id_user",
    [req.body.id],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res
          .status(200)
          .json({ msg: "QUESTIONS LIST GOT!", list: result });
      }
    }
  );
});

router.post("/createsondage", (req, res, next) => {
  var body = req.body;
  var lib_sondage = body.lib_sondage;
  lib_sondage = lib_sondage.trim();
  var type_prestation = body.type_prestation;
  var prestation_sondage = body.prestation_sondage;

  var quest_1 = body.quest_1;
  if (quest_1) {
    quest_1 = quest_1.trim();
  }
  var quest_2 = body.quest_2;
  if (quest_2) quest_2 = quest_2.trim();
  var quest_3 = body.quest_3;
  if (quest_3) quest_3 = quest_3.trim();
  var quest_4 = body.quest_4;
  if (quest_4) quest_4 = quest_4.trim();
  var quest_5 = body.quest_5;
  if (quest_5) quest_5 = quest_5.trim();

  if (
    lib_sondage === undefined ||
    type_prestation === undefined ||
    prestation_sondage === undefined
  ) {
    return res.status(401).json({ msg: "Veuillez remplir tous les champs" });
  }
  db.query(
    "INSERT INTO sondage(lib_sondage, type_prestation, prestation_sondage, quest_1, quest_2, quest_3, quest_4, quest_5, date_creation) VALUES(?,?,?,?,?,?,?,?, now())",
    [
      lib_sondage,
      type_prestation,
      prestation_sondage,
      quest_1,
      quest_2,
      quest_3,
      quest_4,
      quest_5,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res.status(200).json({ msg: "Done!" });
      }
    }
  );
});

router.get("/getSondage/:id/", (req, res, next) => {
  db.query(
    "SELECT * FROM sondage ORDER BY date_creation DESC ",
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        db.query(
          "SELECT DISTINCT reponse.id_sondage AS list_done FROM reponse INNER JOIN sondage ON reponse.id_sondage = sondage.id_sondage AND reponse.id_user = ?;",
          [req.params.id],
          (Err, Result) => {
            if (Err) {
              return res.status(401).json({ msg: Err });
            }

            if (Result) {
              for (i = 0; i < result.length; i++) {
                for (j = 0; j < Result.length; j++) {
                  if (result[i].id_sondage === Result[j].list_done) {
                    result[i].done = "yes";
                    console.log("okay");
                  }
                }
              }
              // console.log(result);
              return res
                .status(200)
                .json({ msg: "got!", sondages: result, list_done: Result });
            }
          }
        );
      }
    }
  );
});

router.get("/ratesurvey/:id_sondage/:user_id", (req, res, next) => {
  var id = req.params.id_sondage;
  db.query(
    "SELECT * FROM sondage WHERE id_sondage = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log("error");
        return res.status(401).json({ msg: err });
      }
      if (result) {
        db.query(
          "SELECT DISTINCT reponse.id_sondage AS list_done FROM reponse INNER JOIN sondage ON reponse.id_sondage = sondage.id_sondage AND reponse.id_user = ?;",
          [req.params.id],
          (Err, Result) => {
            if (Err) {
              return res.status(401).json({ msg: Err });
            }

            if (Result) {
              for (i = 0; i < result.length; i++) {
                for (j = 0; j < Result.length; j++) {
                  if (result[i].id_sondage === Result[j].list_done) {
                    result[i].done = "yes";
                    console.log("okay");
                  }
                }
              }
              // console.log(result);
              return res.status(200).json({ nextPage: result });
            }
          }
        );
      }
    }
  );
});

router.post("/setSondage", (req, res, next) => {
  // console.log(req.body);
  var body = req.body;
  var preo = body.preo;
  var suggest = body.suggest;

  if (preo) {
    preo = preo.trim();
  }

  db.query(
    "INSERT INTO reponse(id_sondage,id_user, re_default_quest1, re_default_quest2, re_quest1, re_quest2, re_quest3, re_quest4, re_quest5, re_preo, re_suggest, re_date) VALUES(?,?,?,?,?,?,?,?,?,?,?,now())",
    [
      req.body.id_sondage,
      req.body.id_user,
      req.body.re_default_quest1,
      req.body.re_default_quest2,
      req.body.re_quest1,
      req.body.re_quest2,
      req.body.re_quest3,
      req.body.re_quest4,
      req.body.re_quest5,
      req.body.re_preo,
      req.body.re_suggest,
    ],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res.status(200).json({ msg: "Added" });
      }
    }
  );
});

router.get("/getListSondage", (req, res, next) => {
  db.query(
    "SELECT * FROM sondage ORDER BY date_creation DESC",
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res.status(200).json({ result: result });
      }
    }
  );
});

router.get("/getReponse/:id_sondage", (req, res, next) => {
  db.query(
    "SELECT DISTINCT * FROM reponse AS r JOIN sondage AS s ON s.id_sondage = r.id_sondage AND s.id_sondage = ? INNER JOIN user AS u ON u.id = r.id_user;",
    [req.params.id_sondage],
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        var tab1 = result;
        //* def question 1
        var def1_five = 0;
        var def1_four = 0;
        var def1_three = 0;
        var def1_two = 0;
        var def1_one = 0;
        console.log();

        //* def question 2
        var def2_five = 0;
        var def2_four = 0;
        var def2_three = 0;
        var def2_two = 0;
        var def2_one = 0;

        //* question 1
        var quest1_five = 0;
        var quest1_four = 0;
        var quest1_three = 0;
        var quest1_two = 0;
        var quest1_one = 0;

        //* question 2
        var quest2_five = 0;
        var quest2_four = 0;
        var quest2_three = 0;
        var quest2_two = 0;
        var quest2_one = 0;

        //* question 3
        var quest3_five = 0;
        var quest3_four = 0;
        var quest3_three = 0;
        var quest3_two = 0;
        var quest3_one = 0;

        //* question 4
        var quest4_five = 0;
        var quest4_four = 0;
        var quest4_three = 0;
        var quest4_two = 0;
        var quest4_one = 0;

        //* question 5
        var quest5_five = 0;
        var quest5_four = 0;
        var quest5_three = 0;
        var quest5_two = 0;
        var quest5_one = 0;

        for (let i = 0; i < tab1.length; i++) {
          const element = tab1;

          if (element[i].re_default_quest1 === 5) {
            def1_five += 1;
          } else if (element[i].re_default_quest1 === 4) {
            def1_four += 1;
          } else if (element[i].re_default_quest1 === 3) {
            def1_three += 1;
          } else if (element[i].re_default_quest1 === 2) {
            def1_two += 1;
          } else if (element[i].re_default_quest1 === 1) {
            def1_one += 1;
          }

          if (element[i].re_default_quest2 === 5) {
            def2_five += 1;
          } else if (element[i].re_default_quest2 === 4) {
            def2_four += 1;
          } else if (element[i].re_default_quest2 === 3) {
            def2_three += 1;
          } else if (element[i].re_default_quest2 === 2) {
            def2_two += 1;
          } else if (element[i].re_default_quest2 === 1) {
            def2_one += 1;
          }

          if (element[i].re_quest1 !== undefined) {
            if (element[i].re_quest1 === 5) {
              quest1_five += 1;
            } else if (element[i].re_quest1 === 4) {
              quest1_four += 1;
            } else if (element[i].re_quest1 === 3) {
              quest1_three += 1;
            } else if (element[i].re_quest1 === 2) {
              quest1_two += 1;
            } else if (element[i].re_quest1 === 1) {
              quest1_one += 1;
            }
          }

          if (element[i].re_quest2 !== undefined) {
            if (element[i].re_quest2 === 5) {
              quest2_five += 1;
            } else if (element[i].re_quest2 === 4) {
              quest2_four += 1;
            } else if (element[i].re_quest2 === 3) {
              quest2_three += 1;
            } else if (element[i].re_quest2 === 2) {
              quest2_two += 1;
            } else if (element[i].re_quest2 === 1) {
              quest2_one += 1;
            }
          }

          if (element[i].re_quest3 !== undefined) {
            if (element[i].re_quest3 === 5) {
              quest3_five += 1;
            } else if (element[i].re_quest3 === 4) {
              quest3_four += 1;
            } else if (element[i].re_quest3 === 3) {
              quest3_three += 1;
            } else if (element[i].re_quest3 === 2) {
              quest3_two += 1;
            } else if (element[i].re_quest3 === 1) {
              quest3_one += 1;
            }
          }

          if (element[i].re_quest4 !== undefined) {
            if (element[i].re_quest4 === 5) {
              quest4_five += 1;
            } else if (element[i].re_quest4 === 4) {
              quest4_four += 1;
            } else if (element[i].re_quest4 === 3) {
              quest4_three += 1;
            } else if (element[i].re_quest4 === 2) {
              quest4_two += 1;
            } else if (element[i].re_quest4 === 1) {
              quest4_one += 1;
            }
          }

          if (element[i].re_quest5 !== undefined) {
            if (element[i].re_quest5 === 5) {
              quest5_five += 1;
            } else if (element[i].re_quest5 === 4) {
              quest5_four += 1;
            } else if (element[i].re_quest5 === 3) {
              quest5_three += 1;
            } else if (element[i].re_quest5 === 2) {
              quest5_two += 1;
            } else if (element[i].re_quest5 === 1) {
              quest5_one += 1;
            }
          }
        }
        return res.status(200).json({
          result: result,
          def1: [def1_one, def1_two, def1_three, def1_four, def1_five],
          def2: [def2_one, def2_two, def2_three, def2_four, def2_five],
          quest1: [
            quest1_one,
            quest1_two,
            quest1_three,
            quest1_four,
            quest1_five,
          ],
          quest2: [
            quest2_one,
            quest2_two,
            quest2_three,
            quest2_four,
            quest2_five,
          ],
          quest3: [
            quest3_one,
            quest3_two,
            quest3_three,
            quest3_four,
            quest3_five,
          ],
          quest4: [
            quest4_one,
            quest4_two,
            quest4_three,
            quest4_four,
            quest4_five,
          ],
          quest5: [
            quest5_one,
            quest5_two,
            quest5_three,
            quest5_four,
            quest5_five,
          ],
        });
      }
    }
  );
});

router.get("/stats/customers", (req, res, next) => {
  db.query("SELECT COUNT(*) AS clients FROM user", (err, result) => {
    if (err) return res.status(401).json({ msg: err });
    if (result) return res.status(200).json({ customers: result });
  });
});

router.get("/stats/customerssurveycompleted", (req, res, next) => {
  db.query(
    "SELECT DISTINCT COUNT(*) AS clientscompleted FROM reponse GROUP BY(id_user)",
    (err, result) => {
      // console.log(result);
      if (err) return res.status(401).json({ msg: err });
      if (result) return res.status(200).json({ customerscompleted: result });
    }
  );
});

router.get("/stats/lastresponse", (req, res, next) => {
  db.query(
    "SELECT * FROM reponse ORDER BY id_user DESC LIMIT 1;",
    (err, result) => {
      if (err) return res.status(401).json({ msg: err });
      if (result) return res.status(200).json({ lastresponse: result });
    }
  );
});

router.get("/stats/all", (req, res, next) => {
  // console.log("z");
  db.query(
    "SELECT DISTINCT * FROM reponse AS r JOIN sondage AS s ON s.id_sondage = r.id_sondage;",
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        var tab1 = result;
        //* def question 1
        var def1_five = 0;
        var def1_four = 0;
        var def1_three = 0;
        var def1_two = 0;
        var def1_one = 0;
        console.log();

        //* def question 2
        var def2_five = 0;
        var def2_four = 0;
        var def2_three = 0;
        var def2_two = 0;
        var def2_one = 0;

        //* question 1
        var quest1_five = 0;
        var quest1_four = 0;
        var quest1_three = 0;
        var quest1_two = 0;
        var quest1_one = 0;

        //* question 2
        var quest2_five = 0;
        var quest2_four = 0;
        var quest2_three = 0;
        var quest2_two = 0;
        var quest2_one = 0;

        //* question 3
        var quest3_five = 0;
        var quest3_four = 0;
        var quest3_three = 0;
        var quest3_two = 0;
        var quest3_one = 0;

        //* question 4
        var quest4_five = 0;
        var quest4_four = 0;
        var quest4_three = 0;
        var quest4_two = 0;
        var quest4_one = 0;

        //* question 5
        var quest5_five = 0;
        var quest5_four = 0;
        var quest5_three = 0;
        var quest5_two = 0;
        var quest5_one = 0;

        for (let i = 0; i < tab1.length; i++) {
          const element = tab1;

          if (element[i].re_default_quest1 === 5) {
            def1_five += 1;
          } else if (element[i].re_default_quest1 === 4) {
            def1_four += 1;
          } else if (element[i].re_default_quest1 === 3) {
            def1_three += 1;
          } else if (element[i].re_default_quest1 === 2) {
            def1_two += 1;
          } else if (element[i].re_default_quest1 === 1) {
            def1_one += 1;
          }

          if (element[i].re_default_quest2 === 5) {
            def2_five += 1;
          } else if (element[i].re_default_quest2 === 4) {
            def2_four += 1;
          } else if (element[i].re_default_quest2 === 3) {
            def2_three += 1;
          } else if (element[i].re_default_quest2 === 2) {
            def2_two += 1;
          } else if (element[i].re_default_quest2 === 1) {
            def2_one += 1;
          }

          if (element[i].re_quest1 !== undefined) {
            if (element[i].re_quest1 === 5) {
              quest1_five += 1;
            } else if (element[i].re_quest1 === 4) {
              quest1_four += 1;
            } else if (element[i].re_quest1 === 3) {
              quest1_three += 1;
            } else if (element[i].re_quest1 === 2) {
              quest1_two += 1;
            } else if (element[i].re_quest1 === 1) {
              quest1_one += 1;
            }
          }

          if (element[i].re_quest2 !== undefined) {
            if (element[i].re_quest2 === 5) {
              quest2_five += 1;
            } else if (element[i].re_quest2 === 4) {
              quest2_four += 1;
            } else if (element[i].re_quest2 === 3) {
              quest2_three += 1;
            } else if (element[i].re_quest2 === 2) {
              quest2_two += 1;
            } else if (element[i].re_quest2 === 1) {
              quest2_one += 1;
            }
          }

          if (element[i].re_quest3 !== undefined) {
            if (element[i].re_quest3 === 5) {
              quest3_five += 1;
            } else if (element[i].re_quest3 === 4) {
              quest3_four += 1;
            } else if (element[i].re_quest3 === 3) {
              quest3_three += 1;
            } else if (element[i].re_quest3 === 2) {
              quest3_two += 1;
            } else if (element[i].re_quest3 === 1) {
              quest3_one += 1;
            }
          }

          if (element[i].re_quest4 !== undefined) {
            if (element[i].re_quest4 === 5) {
              quest4_five += 1;
            } else if (element[i].re_quest4 === 4) {
              quest4_four += 1;
            } else if (element[i].re_quest4 === 3) {
              quest4_three += 1;
            } else if (element[i].re_quest4 === 2) {
              quest4_two += 1;
            } else if (element[i].re_quest4 === 1) {
              quest4_one += 1;
            }
          }

          if (element[i].re_quest5 !== undefined) {
            if (element[i].re_quest5 === 5) {
              quest5_five += 1;
            } else if (element[i].re_quest5 === 4) {
              quest5_four += 1;
            } else if (element[i].re_quest5 === 3) {
              quest5_three += 1;
            } else if (element[i].re_quest5 === 2) {
              quest5_two += 1;
            } else if (element[i].re_quest5 === 1) {
              quest5_one += 1;
            }
          }
        }

        var total_five =
          def1_five +
          def2_five +
          quest1_five +
          quest2_five +
          quest3_five +
          quest4_five +
          quest5_five;
        var total_four =
          def1_four +
          def2_four +
          quest1_four +
          quest2_four +
          quest3_four +
          quest4_four +
          quest5_four;
        var total_three =
          def1_three +
          def2_three +
          quest1_three +
          quest2_three +
          quest3_three +
          quest4_three +
          quest5_three;
        var total_two =
          def1_two +
          def2_two +
          quest1_two +
          quest2_two +
          quest3_two +
          quest4_two +
          quest5_two;
        var total_one =
          def1_one +
          def2_one +
          quest1_one +
          quest2_one +
          quest3_one +
          quest4_one +
          quest5_one;

        console.log(total_five);
        console.log(total_four);
        console.log(total_three);
        console.log(total_three);
        console.log(total_one);
        return res.status(200).json({
          result: result,
          total_five: total_five,
          total_four: total_four,
          total_three: total_three,
          total_two: total_two,
          total_one: total_one,
        });
      }
    }
  );
});

router.post("/besoin", (req, res, next) => {
  // console.log(
  //   req.body.nb_prestation,
  //   req.body.nb_beneficiaire,
  //   req.body.autre_niveau_hierachique,
  //   req.body.nature_prestation,
  //   req.body.niveau_hierachique,
  //   req.body.aptitude_info,
  //   req.body.detail_besoin,
  //   req.body.start_date,
  //   req.body.end_date,
  //   req.body.budget,
  //   req.body.nom_structure,
  //   req.body.email,
  //   req.body.contact
  // );
  db.query(
    "INSERT INTO besoin(nom_structure, email, contact, nature_prestation, nb_prestation, nb_beneficiaire, niveau_hierachique, autre_niveau_hierachique, aptitude_info, detail_besoin, start_date, end_date, budget) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      req.body.nom_structure,
      req.body.email,
      req.body.contact,
      req.body.nature_prestation,
      req.body.nb_prestation,
      req.body.nb_beneficiaire,
      req.body.niveau_hierachique,
      req.body.autre_niveau_hierachique,
      req.body.aptitude_info,
      req.body.detail_besoin,
      req.body.start_date,
      req.body.end_date,
      req.body.budget,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res.status(200).json({
          msg: "Votre demande sera traitée dans les plus brefs délais",
        });
      }
    }
  );
});

router.get("/getBesoin", (req, res, next) => {
  db.query("SELECT * FROM besoin", (err, result) => {
    if (err) {
      return res.status(401).json({ msg: err });
    }
    if (result) {
      return res.status(200).json({ msg: "List got!", result: result });
    }
  });
});

router.get("/stats/getNbEtu", (req, res, next) => {
  db.query(
    "SELECT DISTINCT COUNT(*) AS nb FROM user WHERE statut = 'etudiant'",
    (err, result) => {
      if (err) {
        return res.status(401).json({ msg: err });
      }
      if (result) {
        return res.status(200).json({ msg: "List got!", nbEtu: result });
      }
    }
  );
});

module.exports = router;
