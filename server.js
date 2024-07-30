const express = require('express');
const app = express();
const path = require('path');
const storeService = require('./store-service');

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

// Route to get all published items
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

// Route to get all items
app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

// Route to get all categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Start the server only after initializing the store service
const HTTP_PORT = process.env.PORT || 8080;
storeService.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port ${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.log(`Unable to start server: ${err}`);
    });

// Export the app
module.exports = app;