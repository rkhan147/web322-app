const fs = require('fs');

let items = [];
let categories = [];

module.exports = {
    initialize: function () {
        return new Promise((resolve, reject) => {
            fs.readFile('./data/items.json', 'utf8', (err, data) => {
                if (err) {
                    reject("unable to read file");
                } else {
                    items = JSON.parse(data);
                    fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                        if (err) {
                            reject("unable to read file");
                        } else {
                            categories = JSON.parse(data);
                            resolve();
                        }
                    });
                }
            });
        });
    },
    getAllItems: function () {
        return new Promise((resolve, reject) => {
            if (items.length === 0) {
                reject("no results returned");
            } else {
                resolve(items);
            }
        });
    },
    getPublishedItems: function () {
        return new Promise((resolve, reject) => {
            const publishedItems = items.filter(item => item.published === true);
            if (publishedItems.length === 0) {
                reject("no results returned");
            } else {
                resolve(publishedItems);
            }
        });
    },
    getCategories: function () {
        return new Promise((resolve, reject) => {
            if (categories.length === 0) {
                reject("no results returned");
            } else {
                resolve(categories);
            }
        });
    }
};
