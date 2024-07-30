const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Redirect the root URL to /about
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html file for the /about route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Start the server
const HTTP_PORT = process.env.PORT || 8080;
app.listen(HTTP_PORT, () => {
    console.log(`Express http server listening on port ${HTTP_PORT}`);
});
