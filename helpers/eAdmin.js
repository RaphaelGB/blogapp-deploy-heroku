//Helpers - cria middlewares para interferir na aplicação ajudando em algo
module.exports = {
    eAdmin: function (req, res, next){

        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }; //isAuthenticated() - Método do passport para ver se um usuário está logado

        req.flash("error_msg", "Você precisa ser um admin");
        res.redirect('/');
    }
}