// Ensure we are using the correct database
use plp_bookstore;

print("\n--- Task 2: Basic CRUD Operations ---");

// 1. Find all books in a specific genre (e.g., 'Thriller')
print("\n1. All 'Thriller' books:");
db.books.find({ genre: "Thriller" }).forEach(printjson);

// 2. Find books published after a certain year (e.g., after 2015)
print("\n2. Books published after 2015:");
db.books.find({ published_year: { $gt: 2015 } }).forEach(printjson);

// 3. Find books by a specific author (e.g., 'Andy Weir')
print("\n3. Books by 'Andy Weir':");
db.books.find({ author: "Andy Weir" }).forEach(printjson);

// 4. Update the price of a specific book ('The Silent Patient')
print("\n4. Updating price of 'The Silent Patient' to $16.50...");
db.books.updateOne(
    { title: "The Silent Patient" },
    { $set: { price: 16.50 } }
);
print("Update status:");
db.books.find({ title: "The Silent Patient" }).forEach(printjson);


// 5. Delete a book by its title ('Lord of the Flies')
print("\n5. Deleting book 'Lord of the Flies'...");
db.books.deleteOne({ title: "Lord of the Flies" });
print("Deletion attempt status (should return 0 documents):");
db.books.find({ title: "Lord of the Flies" }).forEach(printjson);


print("\n--- Task 3: Advanced Queries ---");

// 1. Find books that are both in stock and published after 2010
print("\n1. Books in stock AND published after 2010:");
db.books.find({
    in_stock: true,
    published_year: { $gt: 2010 }
}).forEach(printjson);


// 2. Use projection to return only the title, author, and price fields (and exclude _id)
print("\n2. Books with only Title, Author, Price (Projection):");
db.books.find(
    { genre: "Fiction" },
    { title: 1, author: 1, price: 1, _id: 0 } // Projection
).forEach(printjson);


// 3. Implement sorting to display books by price (ascending and descending)
print("\n3a. Books sorted by Price (Ascending):");
db.books.find().sort({ price: 1 }).limit(3).forEach(printjson);

print("\n3b. Books sorted by Price (Descending):");
db.books.find().sort({ price: -1 }).limit(3).forEach(printjson);


// 4. Use the limit and skip methods to implement pagination (5 books per page)
const pageSize = 5;

// Page 1
print(`\n4a. Pagination - Page 1 (Limit ${pageSize}, Skip 0):`);
db.books.find().limit(pageSize).skip(0).forEach(printjson);

// Page 2
print(`\n4b. Pagination - Page 2 (Limit ${pageSize}, Skip ${pageSize}):`);
db.books.find().limit(pageSize).skip(pageSize).forEach(printjson);


print("\n--- Task 4: Aggregation Pipeline ---");

// 1. Calculate the average price of books by genre
print("\n1. Average Price by Genre:");
db.books.aggregate([
    {
        $group: {
            _id: "$genre",
            average_price: { $avg: "$price" },
            total_books: { $sum: 1 }
        }
    },
    { $sort: { average_price: -1 } } // Sort by highest average price
]).forEach(printjson);

// 2. Find the author with the most books in the collection
print("\n2. Author with the Most Books:");
db.books.aggregate([
    {
        $group: {
            _id: "$author",
            book_count: { $sum: 1 }
        }
    },
    { $sort: { book_count: -1 } }, // Sort to put the highest count first
    { $limit: 1 } // Take only the top author
]).forEach(printjson);


// 3. Implement a pipeline that groups books by publication decade and counts them
print("\n3. Books Grouped by Publication Decade:");
db.books.aggregate([
    {
        $group: {
            // Calculate the decade: Truncate the year to the nearest 10, then add 's'
            _id: {
                $concat: [
                    { $toString: { $multiply: [10, { $floor: { $divide: ["$published_year", 10] } }] } },
                    "s"
                ]
            },
            count: { $sum: 1 }
        }
    },
    { $sort: { _id: 1 } } // Sort the decades chronologically
]).forEach(printjson);


print("\n--- Task 5: Indexing ---");

// Clean up existing indexes (optional, for a fresh start)
db.books.dropIndexes();
print("\nIndexes dropped for demonstration.");

// 1. Create an index on the title field for faster searches
print("\n1. Creating index on 'title' field...");
db.books.createIndex({ title: 1 });
print("Current Indexes:");
printjson(db.books.getIndexes());

// 2. Create a compound index on author and published_year
print("\n2. Creating compound index on 'author' and 'published_year'...");
db.books.createIndex({ author: 1, published_year: -1 });
print("Current Indexes:");
printjson(db.books.getIndexes());

// 3. Use the explain() method to demonstrate performance improvement

// Test 1: Search by Author (No Index)
print("\n3a. Explain: Author search *before* Compound Index (should use COLLECTION SCAN):");
db.books.find({ author: "Matt Haig" }).explain("executionStats");
// Note: The executionStats might still show a COLLSCAN if the collection is very small.

// Test 2: Search by Author (Now using Compound Index)
print("\n3b. Explain: Author search *after* Compound Index (should use IXSCAN):");
db.books.find({ author: "Matt Haig" }).explain("executionStats");

// Test 3: Search by Title (Now using Single Field Index)
print("\n3c. Explain: Title search *after* Single Field Index (should use IXSCAN):");
db.books.find({ title: "Project Hail Mary" }).explain("executionStats");
