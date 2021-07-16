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

function swapBook(allBook) {
  const { id, name, publisher } = allBook;
  return { id, name, publisher };
}

const getAllBooksHandler = (request, h) => {
  const { name: keywordBook, reading, finished } = request.query;
  let allBook = [];

  console.log(reading);

  if (keywordBook) {
    allBook = books.filter(
      (book) =>
        book.name.toLowerCase().indexOf(keywordBook.toLowerCase()) !== -1
    );
    allBook = swapBook(allBook);
  } else if (parseInt(reading, 10) === 0 || parseInt(reading, 10) === 1) {
    allBook = books.filter((book) => book.reading === reading);
    allBook = swapBook(allBook);
  } else if (parseInt(finished, 10) === 0 || parseInt(finished, 10) === 1) {
    allBook = books.filter((book) => book.reading === finished);
    allBook = swapBook(allBook);
  } else {
    books.forEach((book) => {
      allBook.push(swapBook(book));
    });
  }

  console.log(allBook);

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
