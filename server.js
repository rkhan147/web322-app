const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

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
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer(); // no disk storage

// Routes
app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err.message }));
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
        res.json(items);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err.message }));
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/addItem.html'));
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
    res.status(404).send('Page Not Found');
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
