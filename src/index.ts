import express, { Request, Response } from "express";
import mysql from "mysql2/promise";
import path from "path";

const server = express();

// Configurações do servidor e do EJS
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views')); // Alterado para 'views'

// Conexão com o banco de dados MySQL
const db = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "senha123",
    database: "blog_db"
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Rota para listar categorias
server.get('/categorias', async (req: Request, res: Response) => {
    const [categorias] = await db.query("SELECT * FROM categorias");
    res.render('categories/list', { categorias });
});

// Rota para exibir o formulário de categorias
server.get("/categorias/form", (req: Request, res: Response) => {
    res.render("categories/formCate");
});

// Rota para salvar uma nova categoria
server.post("/categorias/salvar", async (req: Request, res: Response) => {
    const { nome } = req.body;
    const sqlInsert = "INSERT INTO categorias (nome) VALUES (?)";
    await db.query(sqlInsert, [nome]);
    res.redirect("/categorias");
});

// Rota para deletar uma categoria
server.post("/categorias/deletar/:id", async (req: Request, res: Response) => {
    const categoriaId = req.params.id;
    const sqlDelete = "DELETE FROM categorias WHERE id = ?";
    await db.query(sqlDelete, [categoriaId]);
    res.redirect("/categorias");
});

// Rota para exibir o formulário de usuários
server.get('/usuarios/novo', (req: Request, res: Response) => {
    res.render('formUsuario');
});

// Rota para cadastrar um novo usuário
server.post('/usuarios', async (req: Request, res: Response) => {
    const { nome, email, senha, papel, ativo } = req.body;
    const statusAtivo = ativo === 'on' ? true : false;
    const sqlInsert = 'INSERT INTO usuarios (nome, email, senha, papel, ativo) VALUES (?,?,?,?,?)';
    await db.query(sqlInsert, [nome, email, senha, papel, statusAtivo]);
    res.redirect('/usuarios');
});

// Rota para listar usuários
server.get('/usuarios', async (req: Request, res: Response) => {
    const [usuarios] = await db.query("SELECT * FROM usuarios");
    res.render('list', { usuarios });
});

// Rota para deletar um usuário
server.post('/usuarios/deletar/:id', async (req: Request, res: Response) => {
    const usuarioId = req.params.id;
    const sqlDelete = "DELETE FROM usuarios WHERE id = ?";
    await db.query(sqlDelete, [usuarioId]);
    res.redirect("/usuarios");
});

// Rota de login
server.get('/login', (req: Request, res: Response) => {
    res.render('login');
});

// Rota para autenticar login
server.post('/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body;
    const sqlSelect = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    
    try {
        const [usuarios] = await db.query<any[]>(sqlSelect, [email, senha]);

        if (usuarios.length === 0) {
            return res.render('login', { error: 'Usuário ou senha inválidos!' });
        }

        res.redirect('/usuarios');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota inicial
server.get('/', (req: Request, res: Response) => {
    res.render('categories/page');  // Página inicial atualizada para Page.ejs
});

// Iniciando o servidor
server.listen(3000, () => console.log("Servidor rodando na porta 3000: http://localhost:3000/"));