//Carregando módulos
 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const admin = require('./routes/admin');
const { default: mongoose } = require('mongoose');
const session = require("express-session");
const flash = require("connect-flash"); //Tipo de sessão que desaparece quando recarrega
require("./models/Categoria");
    const Categoria = mongoose.model("categorias");
require("./models/Postagem");
     const Postagem = mongoose.model("postagens");
    const usuarios = require("./routes/usuario");
    const passport = require("passport");
    const db = require("./config/db");
    //Configurações
    // Sessão
    app.use(session({
    secret: "cursodeNode",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
require("./config/auth")(passport);
    
app.use(flash());
//Middleware
app.use((req, res, next) => {
    //Criandno variáevel global - res.locals  
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    //req.user - o que o passport cria para usuários logados
    next();
})

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', "handlebars");
// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(() => {
    console.log("Conectado ao mongo!");
}).catch((err) => {
    console.log("Erro ao se conectar com mongo: " + err)
})
//Public

//Rotas


app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: 'desc'}).then((postagens) => {
        
        res.render("index", {postagens: postagens});
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível carregar os posts")
        res.redirect("/404")
    })
});

app.get("/404", (req, res) => {
    res.send("ERROR 404!");
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if(postagem){
            res.render("postagem/index", {postagem: postagem});
        }else{
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro interno")
        console.log(err)
        res.redirect("/");
    
    });
});

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao listar categorias");
        console.log(err)
        res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

                res.render("categorias/postagem", {postagens: postagens, categoria: categoria});
            });
        }else{
            req.flash("error_msg", "houve um erro ao listar os posts");
            res.redirect("/");    
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao carregar a página da categoria");
        console.log(err)
        res.redirect("/");
    });
})

app.use("/admin", admin);
app.use("/usuarios", usuarios);

//Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log("Servidor Rodando!");
});


// Public - Middleware

// app.use((req, res, next) => {
//     console.log("oi eu sou um middleware");
//     next(); //Manda passar a aplicação
// });          