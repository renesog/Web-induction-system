const express = require('express');
const path = require('path');
const app = express(); 

const hostname = '127.0.0.1';
const port = 3000;


app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'web')));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

 
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});