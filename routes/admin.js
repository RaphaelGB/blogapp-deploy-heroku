// Carregando módulos

    const express = require('express');
    const router = express();

  // Chamando model pelo mongoose
    const mongoose = require("mongoose");
    require("../models/Categoria");
    const Categoria = mongoose.model("categorias");
     require("../models/Postagem");
     const Postagem = mongoose.model("postagens");
    const {eAdmin} = require("../helpers/eAdmin"); 
    //{eAdmin} - pega a única função que criamos e cria outra igual com o nome que colocamos
// Criando rotas

  
    router.get('/', (req, res) =>{
        Postagem.find().lean().populate("categoria").sort({data: 'desc'}).then((postagens) => {
            console.log(postagens);
            res.render("index", {postagens: postagens});
        }).catch((err) => {
            req.flash("error_msg", "Não foi possível carregar os posts")
            res.redirect("/404")
        });
    });

    router.get('/posts', eAdmin, (req, res) =>{
        res.send("Página de posts");
    });

    router.get("/categorias",  eAdmin,(req, res) => {
        Categoria.find({}).sort({date: 'desc'}).then((categorias) =>{
            console.log(categorias);
            res.render("admin/categorias", {
                categorias: categorias.map(categoria => categoria.toJSON())          
                });
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            console.log( "O erro foi: "+ err);
            res.redirect("/admin")
        });
    });

    router.post("/categorias/nova",  eAdmin, (req, res)=>{
        //Variáveis do formulário
        nome = req.body.nome;
        slug = req.body.slug;

        //Validando formulários
        var erros = [];

        if(!nome
            || typeof nome == undefined 
            || req.body.nome == null){
                erros.push({texto: "Nome inválido"});
        }
        
        if(!slug 
            || typeof slug == undefined 
            || slug == null){
                erros.push({texto: "Slug inválido"});
        }


        if(nome.length < 2){
            erros.push({texto: "Nome da categoria é muito pequeno"});
        }

        if(erros.length > 0){
            res.render("admin/addcategorias", {erros: erros});
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            };
            new Categoria(novaCategoria).save().then(() => {
               req.flash("success_msg", "Categoria criada com sucesso");
                res.redirect("/admin/categorias");
            }).catch((err) => {
               req.flash("error_msg", "Houve um erro ao salvar a categoria");

               res.redirect("/admin");
            })
        }
        
    });
    router.get('/categorias/add',  eAdmin, (req, res) =>{
        res.render('admin/addcategorias');
    });

    router.get("/categorias/edit/:id",  eAdmin, (req, res) => {
        //.lean() - Transforma dados do mongoose em JSON
       Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
           res.render("admin/editcategorias", {categoria: categoria});
       }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        console.log("O erro foi" + err);
        res.redirect("/admin");
       })
    });

    router.post("/categorias/edit",  eAdmin, (req, res)=>{
        Categoria.findOne({_id: req.body.id}).then((categoria) =>{

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar a edição da categoria");
                console.log(err);
                res.redirect("/admin/categorias");
            
            })

        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao editar a categoria");
            console.log(err);
            res.redirect("/admin/categorias");
        });
    });

router.post("/categorias/deletar",  eAdmin, (req, res) => {
    const id = req.body.id;
    Categoria.deleteOne({_id: id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso");
        res.redirect("/admin/categorias");
    }).catch( (err) => {
        req.flash("error_msg", "Erro ao deletar a categoria");
        console.log(err);
        res.redirect("/admin");
    });
});

//Model Postagem

router.get("/postagens",  eAdmin, (req,res) => {
   Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
       res.render("admin/postagens", {postagens: postagens});

   }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar a lista de postagens");
        console.log(err);
        res.redirect("/admin");
   })
   
});

router.get("/postagens/add",  eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        console.log(err);
        res.redirect("/admin");
    })
});


router.post("/postagens/nova",  eAdmin, (req, res) => {
    var erros = [];

    if(req.body.categoria == "0"){
        erros.push({text: "Categoria inválida, registre uma categoria"});
    };

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros});
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso! ");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao tentar cadastrar uma postagem");
            console.log(err);
            res.redirect("/admin/postagens");
        })
    }
});

router.get("/postagens/edit/:id",  eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
        
            res.render("admin/editpostagem", {categorias: categorias, postagem: postagem});

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao tentar listar as categorias");
            console.log(err);
            res.redirect("/admin/postagens");
        });

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao tentar editar uma postagem");
        console.log(err);
        res.redirect("/admin/postagens");
    });
    
});

router.post("/postagem/editar",  eAdmin, (req, res) =>{
    
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem adicionada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno");
        console.log(err);
        res.redirect("/admin/postagens");
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição");
        console.log(err);
        res.redirect("/admin/postagens");
    });

});

router.get('/postagens/deletar/:id',  eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(()=> {
        req.flash('success_msg',`Postagem deletada com sucesso`)
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg','Houve um erro ao deletar a postagem')
        console.log("Erro ao deletar: ",err)
        res.redirect('/admin/postagens')
    })
})

// Exportando as rotas
    
    module.exports = router;