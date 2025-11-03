const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// ========== TASK 6: REGISTER USER ==========
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            message: "Username and password are required" 
        });
    }

    if (!isValid(username)) {
        return res.status(400).json({ 
            message: "Username must be at least 3 characters long and alphanumeric" 
        });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ 
            message: "Username already exists" 
        });
    }

    users.push({ username, password });
    return res.status(201).json({ 
        message: "User registered successfully" 
    });
});

// ========== TASK 1: GET ALL BOOKS ==========
public_users.get('/', function (req, res) {
    return res.status(200).json({
        message: "Books retrieved successfully",
        books: books
    });
});

// ========== TASK 2: GET BOOK BY ISBN ==========
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json({
            message: "Book found successfully",
            book: books[isbn]
        });
    } else {
        return res.status(404).json({
            message: "Book not found with the provided ISBN"
        });
    }
});

// ========== TASK 3: GET BOOKS BY AUTHOR ==========
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const booksByAuthor = {};

    for (const isbn in books) {
        if (books[isbn].author.toLowerCase().includes(author)) {
            booksByAuthor[isbn] = books[isbn];
        }
    }

    if (Object.keys(booksByAuthor).length > 0) {
        return res.status(200).json({
            message: "Books by author retrieved successfully",
            books: booksByAuthor
        });
    } else {
        return res.status(404).json({
            message: "No books found by this author"
        });
    }
});

// ========== TASK 4: GET BOOKS BY TITLE ==========
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const booksByTitle = {};

    for (const isbn in books) {
        if (books[isbn].title.toLowerCase().includes(title)) {
            booksByTitle[isbn] = books[isbn];
        }
    }

    if (Object.keys(booksByTitle).length > 0) {
        return res.status(200).json({
            message: "Books by title retrieved successfully",
            books: booksByTitle
        });
    } else {
        return res.status(404).json({
            message: "No books found with this title"
        });
    }
});

// ========== TASK 5: GET BOOK REVIEWS ==========
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ 
            message: "Book not found with the provided ISBN" 
        });
    }

    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
        return res.status(404).json({ 
            message: "No reviews found for this book" 
        });
    }

    return res.status(200).json({
        message: "Book reviews retrieved successfully",
        reviews: books[isbn].reviews
    });
});

// ========== TASK 10: GET ALL BOOKS USING ASYNC/AWAIT ==========
public_users.get('/async/books', async function (req, res) {
    try {
        const bookList = await new Promise((resolve) => {
            setTimeout(() => resolve(books), 100);
        });

        return res.status(200).json({
            message: "Books retrieved successfully using async/await",
            books: bookList
        });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// ========== TASK 11: GET BOOK BY ISBN USING PROMISES ==========
public_users.get('/promise/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            book ? resolve(book) : reject("Book not found with the provided ISBN");
        }, 100);
    })
    .then(book => res.status(200).json({ message: "Book found successfully using Promise", book }))
    .catch(error => res.status(404).json({ message: error }));
});

// ========== TASK 12: GET BOOKS BY AUTHOR USING ASYNC/AWAIT ==========
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();

    try {
        const booksByAuthor = await new Promise((resolve) => {
            setTimeout(() => {
                const filtered = {};
                for (const isbn in books) {
                    if (books[isbn].author.toLowerCase().includes(author)) {
                        filtered[isbn] = books[isbn];
                    }
                }
                resolve(filtered);
            }, 100);
        });

        if (Object.keys(booksByAuthor).length === 0) {
            return res.status(404).json({ message: "No books found by this author" });
        }

        return res.status(200).json({
            message: "Books by author retrieved successfully using async/await",
            books: booksByAuthor
        });
    } catch (error) {
        return res.status(500).json({ message: "Error searching books by author" });
    }
});

// ========== TASK 13: GET BOOKS BY TITLE USING PROMISES ==========
public_users.get('/promise/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();

    new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByTitle = {};
            for (const isbn in books) {
                if (books[isbn].title.toLowerCase().includes(title)) {
                    booksByTitle[isbn] = books[isbn];
                }
            }
            Object.keys(booksByTitle).length > 0 ? resolve(booksByTitle) : reject("No books found with this title");
        }, 100);
    })
    .then(books => res.status(200).json({ message: "Books by title retrieved successfully using Promise", books }))
    .catch(error => res.status(404).json({ message: error }));
});

module.exports.general = public_users;
