const fs = require('fs').promises;
const path = require('path');

let items = [];
let categories = [];

const initialize = async () => {
    try {
        const itemsPath = path.join(__dirname, 'data/items.json');
        const categoriesPath = path.join(__dirname, 'data/categories.json');
                
        const [itemsData, categoriesData] = await Promise.all([
            fs.readFile(itemsPath, 'utf8'),
            fs.readFile(categoriesPath, 'utf8')
        ]);
        
        items = JSON.parse(itemsData);
        categories = JSON.parse(categoriesData);
    } catch (err) {
        console.error("Unable to read file", err);
        throw new Error("Unable to read file");
    }
};

const getAllItems = async () => {
    if (items.length > 0) {
        return items;
    } else {
        throw new Error("No results returned");
    }
};

const getPublishedItems = async () => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length > 0) {
        return publishedItems;
    } else {
        throw new Error("No results returned");
    }
};

const getCategories = async () => {
    if (categories.length > 0) {
        return categories;
    } else {
        throw new Error("No results returned");
    }
};

const getItemsByCategory = async (category) => {
    const filteredItems = items.filter(item => item.category === category);
    if (filteredItems.length > 0) {
        return filteredItems;
    } else {
        throw new Error("No results returned");
    }
};

const getItemsByMinDate = async (minDateStr) => {
    const minDate = new Date(minDateStr);
    const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
    if (filteredItems.length > 0) {
        return filteredItems;
    } else {
        throw new Error("No results returned");
    }
};

const getItemById = async (id) => {
    const item = items.find(item => item.id === id);
    if (item) {
        return item;
    } else {
        throw new Error("No result returned");
    }
};

const addItem = async (itemData) => {
    itemData.published = itemData.published ?? false;
    itemData.id = items.length + 1;
    itemData.itemDate = new Date().toISOString().split('T')[0]; // Set itemDate
    items.push(itemData);
    return itemData;
};

const getPublishedItemsByCategory = async (category) => {
    const filteredItems = items.filter(item => item.published && item.category === category);
    if (filteredItems.length > 0) {
        return filteredItems;
    } else {
        throw new Error("No results returned");
    }
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem,
    getPublishedItemsByCategory
};
