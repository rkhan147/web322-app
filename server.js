/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or 
* distributed to other students.
* 
* Name: Ridwan Khan Student ID: 162409213 Date: 2024-07-31
*
* Vercel Web App URL: https://web322-app-nine-topaz.vercel.app/
*
* GitHub Repository URL: https://github.com/rkhan147/web322-app
*
********************************************************************************/

// Importing required modules
const express = require('express');
const path = require('path');
const storeService = require('./store-service'); // Custom service for database interactions
const multer = require('multer'); // Middleware for handling file uploads
const cloudinary = require('cloudinary').v2; // Cloudinary SDK for image hosting
const streamifier = require('streamifier'); // Helper for converting buffers to streams
const exphbs = require('express-handlebars'); // Handlebars templating engine

const app = express();
const PORT = process.env.PORT || 8080; // Port for the application

// Cloudinary configuration for image upload
cloudinary.config({
    cloud_name: 'dnwi13efa',
    api_key: '634193897627138',
    api_secret: 'JzeTSk_2eP9wnnEg4qhIAP3FI90',
    secure: true
});

// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use(express.json()); // Parse JSON data in request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

const upload = multer(); // Configure multer for file upload without disk storage

// Handlebars setup for templating
app.engine('.hbs', exphbs.engine({
    extname: '.hbs', // Set file extension for templates
    helpers: {
        // Helper for creating navigation links
        navLink: function(url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        // Helper for comparing two values
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        // Helper for formatting dates
        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));
app.set('views', path.join(__dirname, 'views')); // Set directory for views
app.set('view engine', '.hbs'); // Set Handlebars as the templating engine

// Middleware to determine and set the active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Route handlers
app.get('/', (req, res) => {
    res.redirect('/shop'); // Redirect root to the shop page
});

app.get('/about', (req, res) => {
    res.render('about'); // Render the 'about' page
});

app.get('/shop', async (req, res) => {
    try {
        const items = await storeService.getPublishedItems(); // Get published items from store service
        const categories = await storeService.getCategories(); // Get categories from store service
        res.render('shop', {
            items: items,
            categories: categories,
            item: items[0] // Default item to display
        });
    } catch (err) {
        res.render('shop', { message: "no results" }); // Handle errors and render with a message
    }
});

app.get('/items', async (req, res) => {
    try {
        let items;
        // Filter items based on query parameters
        if (req.query.category) {
            items = await storeService.getItemsByCategory(req.query.category);
        } else if (req.query.minDate) {
            items = await storeService.getItemsByMinDate(req.query.minDate);
        } else {
            items = await storeService.getAllItems();
        }
        res.render('items', { items: items });
    } catch (err) {
        res.render('items', { message: "no results" });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await storeService.getCategories(); // Get categories from store service
        res.render('categories', { categories: categories });
    } catch (err) {
        res.render('categories', { message: "no results" });
    }
});

app.get('/items/add', async (req, res) => {
    try {
        const categories = await storeService.getCategories(); // Get categories for the 'add item' form
        res.render('addItem', { categories: categories });
    } catch (err) {
        res.render('addItem', { categories: [] });
    }
});

app.post('/items/add', upload.single('featureImage'), async (req, res) => {
    try {
        let imageUrl = '';

        if (req.file) {
            // Function to handle image upload to Cloudinary
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const upload = async (req) => {
                let result = await streamUpload(req);
                return result;
            };

            const uploaded = await upload(req);
            imageUrl = uploaded.url; // Set image URL
        }

        req.body.featureImage = imageUrl;
        req.body.itemDate = new Date().toISOString().split('T')[0]; // Set itemDate to current date
        await storeService.addItem(req.body); // Add new item to store
        res.redirect('/items');
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle errors during item addition
    }
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory'); // Render the 'add category' page
});

app.post('/categories/add', async (req, res) => {
    try {
        await storeService.addCategory(req.body); // Add new category
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle errors during category addition
    }
});

app.get('/categories/delete/:id', async (req, res) => {
    try {
        await storeService.deleteCategoryById(req.params.id); // Delete category by ID
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ message: "Unable to Remove Category / Category not found" }); // Handle errors during category deletion
    }
});

app.get('/items/delete/:id', async (req, res) => {
    try {
        await storeService.deleteItemById(req.params.id); // Delete item by ID
        res.redirect('/items');
    } catch (err) {
        res.status(500).json({ message: "Unable to Remove Item / Item not found" }); // Handle errors during item deletion
    }
});

// 404 route for undefined paths
app.use((req, res) => {
    res.status(404).render('404');
});

// Initialize and start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log(`Unable to start server: ${err}`);
    });

module.exports = app;
