To start locally run: 

```bash
docker-compose up
```

To stop run (data in db will be saved in volume, in case if volume wasn't deleted): 

```bash
docker-compose down
```

Queries:

query GetAuthor {
  getAuthor(id: 1) {
    id
    firstName
    lastName
    books {
      id
      title
    }
  }
}

query GetAllAuthors {
  getAuthors {
    id
    firstName
    lastName
    books {
      id
      title
    }
  }
}

query GetAuthorsByBookRange {
  getAuthors(minNumberOfBooks: 3, maxNumberOfBooks: 6) {
    id
    firstName
    lastName
    books {
      id
      title
    }
  }
}

mutation CreateAuthor {
  createAuthor(author: {
    firstName: "Leo",
    lastName: "Tolstoy"
  }) {
    id
    firstName
    lastName
    books {
      id
      title
    }
  }
}

mutation AddAuthorToBook {
  addAuthor(bookId: 1, authorId: 2) {
    id
    title
    authors {
      id
      firstName
      lastName
    }
  }
}

mutation DeleteAuthor {
  deleteAuthor(id: 1)
}

mutation DeleteAuthorWithBooks {
  deleteAuthorWithBooks(id: 2)
}

query GetBook {
  getBook(id: 1) {
    id
    title
    authors {
      id
      firstName
      lastName
    }
  }
}

query GetBooksByTitle {
  getBooks(title: "Example Title") {
    id
    title
    authors {
      id
      firstName
      lastName
    }
  }
}

mutation CreateBook {
  createBook(book: {
    title: "New Book",
    authorIds: [1, 2]  # Assuming these authors exist
  }) {
    id
    title
    authors {
      id
      firstName
      lastName
    }
  }
}

mutation DeleteBook {
  deleteBook(id: 1)
}

mutation AddAuthorToBook {
  addAuthorToBook(bookId: 1, authorId: 2) {
    id
    title
    authors {
      id
      firstName
      lastName
    }
  }
}