const express = require('express');
const app = express()

app.use(express.json());

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

app.get('/users',(req, res)=>{
    res.send(users);
})

app.get('/users/:id', (req, res)=>{
    const user = users.find(u=>u.id==req.params.id);
    if(!user){
        res.status(404).send('User does not exist or something went wrong');
    }
    res.send(user);
})

app.listen(3000, ()=>{
    console.log('User service is running');
})