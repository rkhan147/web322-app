// Import necessary modules
const pg = require('pg'); // PostgreSQL client (not used directly here)
const Sequelize = require('sequelize'); // Sequelize ORM for database operations

// Initialize Sequelize with connection settings for Neon database
var sequelize = new Sequelize('neondb', 'neondb_owner', 'XtM94YjSzFxU', {
    host: 'ep-bitter-dream-a5k5rfgr.us-east-2.aws.neon.tech', // Database host
    dialect: 'postgres', // Database dialect
    port: 5432, // Database port
    dialectOptions: {
        ssl: { rejectUnauthorized: false } // SSL options for secure connection
    },
    query: { raw: true } // Return raw data from queries
});

// Define the 'Item' model with attributes and types
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT, // Item description
    title: Sequelize.STRING, // Item title
    itemDate: Sequelize.DATE, // Date item was added
    featureImage: Sequelize.STRING, // URL for the item's image
    published: Sequelize.BOOLEAN, // Publication status
    price: Sequelize.DOUBLE // Item price
});

// Define the 'Category' model with attributes and types
const Category = sequelize.define('Category', {
    category: Sequelize.STRING // Category name
});

// Define relationship: An Item belongs to a Category
Item.belongsTo(Category, { foreignKey: 'category' });

// Initialize the database connection and sync models
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync() // Sync models with the database
            .then(() => resolve()) // Resolve promise if successful
            .catch(err => reject("unable to sync the database")); // Reject promise if an error occurs
    });
};

// Fetch all items from the database
module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll() // Query to find all items
            .then(data => resolve(data)) // Resolve promise with retrieved data
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Fetch items by category
module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category } // Query to find items by category
        })
            .then(data => resolve(data)) // Resolve promise with retrieved data
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Fetch items by minimum date
module.exports.getItemsByMinDate = (minDateStr) => {
    const { gte } = Sequelize.Op; // Operator for 'greater than or equal to'
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr) // Query to find items with itemDate greater than or equal to minDateStr
                }
            }
        })
            .then(data => resolve(data)) // Resolve promise with retrieved data
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Fetch an item by its ID
module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: id } // Query to find item by ID
        })
            .then(data => resolve(data[0])) // Resolve promise with the first item in the result
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Add a new item to the database
module.exports.addItem = (itemData) => {
    itemData.published = (itemData.published) ? true : false; // Ensure published is a boolean
    for (let prop in itemData) {
        if (itemData[prop] === "") itemData[prop] = null; // Set empty fields to null
    }
    itemData.itemDate = new Date(); // Set the current date as itemDate
    return new Promise((resolve, reject) => {
        Item.create(itemData) // Create new item
            .then(() => resolve()) // Resolve promise if successful
            .catch(err => reject("unable to create item")); // Reject promise if an error occurs
    });
};

// Fetch all published items
module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true } // Query to find only published items
        })
            .then(data => resolve(data)) // Resolve promise with retrieved data
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Fetch all published items by category
module.exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true, // Only published items
                category: category // Filter by category
            }
        })
            .then(data => resolve(data)) // Resolve promise with retrieved data
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Fetch all categories from the database
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll() // Query to find all categories
            .then(data => resolve(data)) // Resolve promise with retrieved data
            .catch(err => reject("no results returned")); // Reject promise if an error occurs
    });
};

// Add a new category to the database
module.exports.addCategory = (categoryData) => {
    for (let prop in categoryData) {
        if (categoryData[prop] === "") categoryData[prop] = null; // Set empty fields to null
    }
    return new Promise((resolve, reject) => {
        Category.create(categoryData) // Create new category
            .then(() => resolve()) // Resolve promise if successful
            .catch(err => reject("unable to create category")); // Reject promise if an error occurs
    });
};

// Delete a category by its ID
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id } // Query to delete category by ID
        })
            .then(() => resolve()) // Resolve promise if successful
            .catch(err => reject("unable to delete category")); // Reject promise if an error occurs
    });
};

// Delete an item by its ID
module.exports.deleteItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id } // Query to delete item by ID
        })
            .then(() => resolve()) // Resolve promise if successful
            .catch(err => reject("unable to delete item")); // Reject promise if an error occurs
    });
};
