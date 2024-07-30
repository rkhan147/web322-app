const fs = require('fs').promises;
const path = require('path');

let items = [];
let categories = [];

const initialize = async () => {
    try {
        const itemsData = await fs.readFile(path.join(__dirname, 'data/items.json'), 'utf8');
        items = JSON.parse(itemsData);

        const categoriesData = await fs.readFile(path.join(__dirname, 'data/categories.json'), 'utf8');
        categories = JSON.parse(categoriesData);
    } catch (err) {
        throw new Error("unable to read file");
    }
};

const getAllItems = async () => {
    if (items.length > 0) {
        return items;
    } else {
        throw new Error("no results returned");
    }
};

const getPublishedItems = async () => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length > 0) {
        return publishedItems;
    } else {
        throw new Error("no results returned");
    }
};

const getCategories = async () => {
    if (categories.length > 0) {
        return categories;
    } else {
        throw new Error("no results returned");
    }
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};
