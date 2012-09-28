define(["Infra/repositories/books", "Infra/repositories/authors"], function (BookRepository, AuthorRepository) {
    "use strict";

    return {
        books: new BookRepository(),
        authors: new AuthorRepository()
    };
});