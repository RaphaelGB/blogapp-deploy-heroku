if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://blogapp-prod:JUuZr6gh.nj-2cN@cluster0.jwczvoa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    }
} else{
    module.exports ={
        mongoURI: "mongodb://localhost/blogapp"
    }
}