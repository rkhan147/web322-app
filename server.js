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
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dnwi13efa',
    api_key: '634193897627138',
    api_secret: 'JzeTSk_2eP9wnnEg4qhIAP3FI90',
    secure: true
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer(); // no disk storage

// Handlebars setup
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.set('view engine', '.hbs');

// Middleware to set active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/shop', async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        const categories = await storeService.getCategories();
        res.render('shop', {
            items: items,
            categories: categories,
            item: items[0]
        });
    } catch (err) {
        res.render('shop', { message: "no results" });
    }
});

app.get('/items', async (req, res) => {
    try {
        let items;
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
        const categories = await storeService.getCategories();
        res.render('categories', { categories: categories });
    } catch (err) {
        res.render('categories', { message: "no results" });
    }
});

app.get('/items/add', async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render('addItem', { categories: categories });
    } catch (err) {
        res.render('addItem', { categories: [] });
    }
});

app.post('/items/add', upload.single('featureImage'), async (req, res) => {
    try {
        let imageUrl = '';

        if (req.file) {
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
            imageUrl = uploaded.url;
        }

        req.body.featureImage = imageUrl;
        req.body.itemDate = new Date().toISOString().split('T')[0]; // Set itemDate
        await storeService.addItem(req.body);
        res.redirect('/items');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', async (req, res) => {
    try {
        await storeService.addCategory(req.body);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/categories/delete/:id', async (req, res) => {
    try {
        await storeService.deleteCategoryById(req.params.id);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ message: "Unable to Remove Category / Category not found" });
    }
});

app.get('/items/delete/:id', async (req, res) => {
    try {
        await storeService.deleteItemById(req.params.id);
        res.redirect('/items');
    } catch (err) {
        res.status(500).json({ message: "Unable to Remove Item / Item not found" });
    }
});

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
