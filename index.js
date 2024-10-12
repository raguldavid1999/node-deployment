const express = require('express');
const app = express();
const { Pool } = require('pg');
require('dotenv').config();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const users = [
    {
        id: 1,
        name: "Ragul"
    },
    {
        id: 2,
        name: "David"
    }
]

const itemsPool = new Pool({
    connectionString: 'postgresql://root:fRd3GVDon8jexZfnArep4jmPBd3Q41nT@dpg-cs57pag8fa8c73ahjveg-a.oregon-postgres.render.com/test_database_x1mv',
    ssl: {
        rejectUnauthorized: false
    }
});
app.post('/users',async (req, res)=>{
    try{
        const params = req.body;
        const result = await itemsPool.query(`SELECT * FROM public.users WHERE first_name = '${params.first_name}'`);
        res.json(result.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
})

app.get('/users/:id', (req, res)=>{
    const user = users.find(u=>u.id==req.params.id);
    if(!user){
        res.status(404).send('User does not exist or something went wrong');
    }
    res.send(user);
})

app.listen(PORT, ()=>{
    console.log('User service is running');
})