const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if(username && password){
    if(!isValid(username)) {
      users.push({"username": username, "password": password})
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    }
    else {
      return res.status(404).json({message: "User already exists!"});    
    }
  }
  return res.status(404).json({message: "Unable to register user."});
  
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getAllBooks()
    .then(function (allBooks) {
      res.send(JSON.stringify(allBooks, null, 4));
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});

async function getAllBooks() {
  return new Promise(function (resolve) {
    // Simulate an asynchronous operation, e.g., fetching books from a database
    setTimeout(function () {
      resolve(books);
    }, 1000);
  });
}

// Get book details based on ISBN
function getBookDetails(isbn) {
  return new Promise((resolve, reject) => {
    const book = Object.values(books).find((book) => book.isbn === isbn);

    if (book) {
      resolve(book); // Resolve with the book details
    } else {
      reject('Book not found'); // Reject with an error if book not found
    }
  });
}

// Route to retrieve book details based on ISBN
public_users.get('/isbn/:isbn', function(req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from request parameters

  getBookDetails(isbn)
    .then((book) => {
      res.json(book); // Return the book details as JSON
    })
    .catch((error) => {
      res.status(404).json({ error }); // Return error if book not found
    });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  
  const bookKeys = Object.keys(books);
  const matchingBooks = [];

  bookKeys.forEach((key) => {
    const book = books[key];
    if (book.author === author) {
      matchingBooks.push(book);
      
    }
  });

  if (matchingBooks.length === 0) {
    return res.status(404).json({ error: 'No books found for the given author.' });
  }

  res.json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const bookKeys=Object.keys(books);
  const matchingBooks=[]

  bookKeys.forEach((key)=>{
    const book = books[key];
    if(book.title===title){
      matchingBooks.push(book);
    }
  })

  if (matchingBooks.length === 0) {
    return res.status(404).json({ error: 'No books found for the given title.' });
  }

  res.json(matchingBooks);


});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ error: 'No book found for the given ISBN.' });
  }

  const reviews = book.reviews;

  if (!reviews || reviews.length === 0) {
    return res.status(404).json({ error: 'No reviews found for the given book.' });
  }

  res.json(reviews);
});

module.exports.general = public_users;
