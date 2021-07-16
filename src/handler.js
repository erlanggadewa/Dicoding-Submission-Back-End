const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (readPage > pageCount) {
    return h
      .response({
        status: "fail",
        message:
          "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(400);
  }

  if (name === undefined || name === null) {
    return h
      .response({
        status: "fail",
        message: "Gagal menambahkan buku. Mohon isi nama buku",
      })
      .code(400);
  }

  const id = nanoid(16);

  let finished = false;
  if (pageCount === readPage) finished = true;

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  if (books.filter((book) => book.id === id).length === 1) {
    return h
      .response({
        status: "success",
        message: "Buku berhasil ditambahkan",
        data: {
          bookId: id,
        },
      })
      .code(201);
  }

  return h
    .response({
      status: "error",
      message: "Buku gagal ditambahkan",
    })
    .code(500);
};

function moveFilteredBook(bookFiltered, allBook) {
  bookFiltered.forEach((el) => {
    const { id, name, publisher } = el;
    const selectedBook = {
      id,
      name,
      publisher,
    };
    allBook.push(selectedBook);
  });
}
const getAllBooksHandler = (request, h) => {
  const {
    name: keywordBook,
    reading: statusRead,
    finished: statusFinish,
  } = request.query;

  const allBook = [];

  if (keywordBook) {
    const bookFiltered = books.filter(
      (book) =>
        book.name.toLowerCase().indexOf(keywordBook.toLowerCase()) !== -1
    );

    moveFilteredBook(bookFiltered, allBook);
  } else if (parseInt(statusRead, 10) === 0 || parseInt(statusRead, 10) === 1) {
    const bookFiltered = books.filter(
      (book) => book.reading === Boolean(parseInt(statusRead, 10))
    );

    moveFilteredBook(bookFiltered, allBook);
  } else if (
    parseInt(statusFinish, 10) === 0 ||
    parseInt(statusFinish, 10) === 1
  ) {
    const bookFiltered = books.filter(
      (book) => book.finished === Boolean(parseInt(statusFinish, 10))
    );

    moveFilteredBook(bookFiltered, allBook);
  } else {
    moveFilteredBook(books, allBook);
  }
  return h
    .response({
      status: "success",
      data: {
        books: allBook,
      },
    })
    .code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.filter((data) => data.id === id)[0];

  if (book === undefined) {
    return h
      .response({
        status: "fail",
        message: "Buku tidak ditemukan",
      })
      .code(404);
  }

  return h
    .response({
      status: "success",
      data: {
        book,
      },
    })
    .code(200);
};

const editBookByIdHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (name === undefined) {
    return h
      .response({
        status: "fail",
        message: "Gagal memperbarui buku. Mohon isi nama buku",
      })
      .code(400);
  }

  if (readPage > pageCount) {
    return h
      .response({
        status: "fail",
        message:
          "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(400);
  }

  const { id } = request.params;
  const indexBook = books.findIndex((book) => book.id === id);

  if (indexBook === -1) {
    return h
      .response({
        status: "fail",
        message: "Gagal memperbarui buku. Id tidak ditemukan",
      })
      .code(404);
  }

  books[indexBook] = {
    ...books[indexBook],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  };

  return {
    status: "success",
    message: "Buku berhasil diperbarui",
  };
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const indexBook = books.findIndex((book) => book.id === id);

  if (indexBook !== -1) {
    books.splice(indexBook, 1);

    return h
      .response({
        status: "success",
        message: "Buku berhasil dihapus",
      })
      .code(200);
  }

  return h
    .response({
      status: "fail",
      message: "Buku gagal dihapus. Id tidak ditemukan",
    })
    .code(404);
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
