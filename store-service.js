const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data/items.json'), 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading items.json:", err);
                reject("unable to read file");
            } else {
                items = JSON.parse(data);
                console.log("items.json read successfully");

                fs.readFile(path.join(__dirname, 'data/categories.json'), 'utf8', (err, data) => {
                    if (err) {
                        console.error("Error reading categories.json:", err);
                        reject("unable to read file");
                    } else {
                        categories = JSON.parse(data);
                        console.log("categories.json read successfully");
                        resolve();
                    }
                });
            }
        });
    });
};

const getAllItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("no results returned");
        }
    });
};

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("no results returned");
        }
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("no results returned");
        }
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};
