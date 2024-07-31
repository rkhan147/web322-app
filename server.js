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
        console.log("Categories fetched:", categories);
        res.render('categories', { categories: categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.render('categories', { message: "no results" });
    }
});

app.get('/items/add', (req, res) => {
    res.render('addItem');
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

app.get('/item/:id', async (req, res) => {
    try {
        const item = await storeService.getItemById(req.params.id);
        res.json(item);
    } catch (err) {
        res.status(404).json({ message: err.message });
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
