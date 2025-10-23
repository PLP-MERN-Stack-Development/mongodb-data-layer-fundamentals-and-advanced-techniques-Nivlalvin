// -----------------------------------------------------------------
// Task 2: Basic CRUD Operations
// -----------------------------------------------------------------

// 1. Find all books in a specific genre (Fiction)
print("\n--- Task 2.1: Find all Fiction books ---");
db.books.find({ genre: "Fiction" });

// 2. Find books published after a certain year (1950)
print("\n--- Task 2.2: Find books published after 1950 ---");
db.books.find({ published_year: { $gt: 1950 } });

// 3. Find books by a specific author (J.R.R. Tolkien)
print("\n--- Task 2.3: Find books by J.R.R. Tolkien ---");
db.books.find({ author: "J.R.R. Tolkien" });

// 4. Update the price of a specific book (The Alchemist to $11.00)
print("\n--- Task 2.4: Update 'The Alchemist' price to $11.00 ---");
db.books.updateOne(
  { title: "The Alchemist" },
  { $set: { price: 11.00 } }
);

// 5. Delete a book by its title (Wuthering Heights)
print("\n--- Task 2.5: Delete 'Wuthering Heights' ---");
db.books.deleteOne({ title: "Wuthering Heights" });
// NOTE: One book is now deleted, leaving 11 books.

// -----------------------------------------------------------------
// Task 3: Advanced Queries
// -----------------------------------------------------------------

// 1. Find books that are both in stock and published after 1950 (using projection)
// NOTE: Using year 1950 to ensure we get results from the provided data.
print("\n--- Task 3.1: In stock and published after 1950 (Projection: title, author, price) ---");
db.books.find(
  { in_stock: true, published_year: { $gt: 1950 } },
  { title: 1, author: 1, price: 1, _id: 0 }
);

// 2. Implement sorting to display books by price (ascending and descending)
print("\n--- Task 3.2.A: Sort books by price (Ascending) ---");
db.books.find({}, { title: 1, price: 1, _id: 0 }).sort({ price: 1 });

print("\n--- Task 3.2.B: Sort books by price (Descending) ---");
db.books.find({}, { title: 1, price: 1, _id: 0 }).sort({ price: -1 });

// 3. Use the limit and skip methods to implement pagination (5 books per page)
// We sort by 'title' for consistent page order.
print("\n--- Task 3.3.A: Pagination - Page 1 (First 5 books) ---");
db.books.find({}, { title: 1, author: 1, _id: 0 }).sort({ title: 1 }).limit(5).skip(0);

print("\n--- Task 3.3.B: Pagination - Page 2 (Next 5 books) ---");
db.books.find({}, { title: 1, author: 1, _id: 0 }).sort({ title: 1 }).limit(5).skip(5);

// -----------------------------------------------------------------
// Task 4: Aggregation Pipeline
// -----------------------------------------------------------------

// 1. Calculate the average price of books by genre
print("\n--- Task 4.1: Aggregation - Average Price by Genre ---");
db.books.aggregate([
  { $group: {
      _id: "$genre",
      average_price: { $avg: "$price" },
      total_books: { $sum: 1 }
  } },
  { $sort: { average_price: -1 } }
]);

// 2. Find the author with the most books in the collection
print("\n--- Task 4.2: Aggregation - Author with the Most Books ---");
db.books.aggregate([
  { $group: {
      _id: "$author",
      book_count: { $sum: 1 }
  } },
  { $sort: { book_count: -1 } },
  { $limit: 1 }
]);

// 3. Implement a pipeline that groups books by publication decade and counts them
print("\n--- Task 4.3: Aggregation - Books Grouped by Publication Decade ---");
db.books.aggregate([
  { $project: {
      _id: 0,
      title: 1,
      // Calculate the decade (e.g., 1960 -> 1960, 1969 -> 1960)
      decade: { $multiply: [ { $toInt: { $divide: ["$published_year", 10] } }, 10 ] }
  } },
  { $group: {
      _id: "$decade",
      book_count: { $sum: 1 }
  } },
  { $sort: { _id: 1 } }
]);

// -----------------------------------------------------------------
// Task 5: Indexing
// -----------------------------------------------------------------

// 1. Create an index on the title field
print("\n--- Task 5.1: Create single index on 'title' ---");
db.books.createIndex({ title: 1 });

// 2. Create a compound index on author and published_year
print("\n--- Task 5.2: Create compound index on 'author' and 'published_year' ---");
db.books.createIndex({ author: 1, published_year: -1 });

// 3. Use explain() to demonstrate the performance (executionStats mode)

// Demonstration 1: Query using the single index (title)
print("\n--- Task 5.3.A: Explain Plan for Title search (using index) ---");
// Look for "winningPlan.stage": "IXSCAN" on the 'title' index
db.books.find({ title: "The Hobbit" }).explain("executionStats");


// Demonstration 2: Query using the compound index (author and published_year)
print("\n--- Task 5.3.B: Explain Plan for Author and Year search (using compound index) ---");
// Look for "winningPlan.stage": "IXSCAN" on the compound index
db.books.find({ author: "J.R.R. Tolkien", published_year: { $gt: 1930 } }).sort({ published_year: -1 }).explain("executionStats");
