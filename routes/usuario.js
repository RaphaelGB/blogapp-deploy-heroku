const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
require('../models/Usuario');
const Usuario = mongoose.model("usuarios");
const bcrypt =  require("bcryptjs")
const passport = require("passport");

router.get("/registro", (req, res) => {
    res.render('usuarios/registro')
});

router.post("/registro", (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome inválido"});
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email inválido"});
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "senha inválida"});
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"});
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas devem ser iguais"});
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    } else 
    { //Cadastro do usuário no banco de dados
        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe um usuário com este login");
                res.redirect("/usuarios/registro");
            }else{
                
                //Gerando hash (insrastreável) para guardar a senha com bcrypt
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                })


                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento");
                            res.redirect("/");
                        }

                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!");
                            res.redirect("/");
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao tentar criar o usuário, tente novamente!");
                            res.redirect("/usuarios/registro");
                        })
                    });
                });
            }
        })

     }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login");
})

router.post("/login", (req, res, next) => {
    console.log(req.user);
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true,
    })(req, res, next);
});

router.get("/logout", (req, res) => {
   //Faz logout direto pelo passport - função assíncrona
    req.logout((err) => {
        if(err) {
            req.flash("error_msg", " Houve um erro a o fazer o logout");
            console.log(err);
            return next(err);
        }
        req.flash("success_msg", "Deslogado com sucesso!");
        res.redirect('/'); 
    }); 
});

module.exports = router;