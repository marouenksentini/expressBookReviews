const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (!username || username.length < 3) {
        return false;
    }
    const alphanumeric = /^[a-zA-Z0-9]+$/;
    return alphanumeric.test(username);
};

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

// ========== TASK 7: LOGIN USER ==========
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username: username }, "access", { expiresIn: '1h' });
        
        req.session.authorization = { accessToken, username };
        
        return res.status(200).json({ 
            message: "Login successful",
            token: accessToken 
        });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// ========== TASK 8: ADD/MODIFY BOOK REVIEW ==========
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review text is required as query parameter" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ 
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

// ========== TASK 9: DELETE BOOK REVIEW ==========
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ 
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
