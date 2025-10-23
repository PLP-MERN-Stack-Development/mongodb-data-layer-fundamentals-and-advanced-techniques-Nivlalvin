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
