const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  let userwithnewname = users.filter((user) => {
    return (user.username == username)
  })
  if (userwithnewname.length > 0) {
    return true
  }
  else {
    return false
  }
}

const authenticatedUser = (username, password) => { //returns boolean

  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  })
  if (validusers.length > 0) {
    return true;
  }
  else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // if (!username || !password) {
  //   return res.status(404).json({ message: "Error logging in" });
  // }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access');

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.query;
  const { username } = req.session;

  // Find the book with the given ISBN
  const book = books.find((book) => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Check if the user has already reviewed the book
  const userReview = book.reviews.find((review) => review.username === username);

  if (userReview) {
    // User has already reviewed the book, modify the existing review
    userReview.review = review;
  } else {
    // User has not reviewed the book, add a new review
    book.reviews.push({ username, review });
  }

  // Send a success response
  res.status(200).json({ message: "Review added/modified successfully" });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const { isbn } = req.params;
  const { username } = req.session;

  // Find the book with the given ISBN
  const book = books.find((book) => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Filter and delete the review based on the session username
  const initialReviewCount = book.reviews.length;
  book.reviews = book.reviews.filter((review) => review.username !== username);
  const finalReviewCount = book.reviews.length;

  if (finalReviewCount === initialReviewCount) {
    return res.status(404).json({ error: "Review not found" });
  }

  // Send a success response
  res.status(200).json({ message: "Review deleted successfully" });



})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
