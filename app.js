// inicialisation of required packages
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");
//----------------------------------------------------------------

// connecting database, initializing mongoose schema and creating model

mongoose.connect("mongodb://127.0.0.1:27017/vocabulary");

// CATEGORY SCHEMA
const categorySchema = new mongoose.Schema({ // creating a new schema for categories
  name: {
    type: String,
    required: [true, "need a name"],
  },
});
const Category = new mongoose.model("Category", categorySchema); //creating a new "category" model

// VOCABULARY SCHEMA
const itemsSchema = new mongoose.Schema({  // creating a new schema for vocabulary items
  name_de: {
    type: String,
    required: [true, "need some value"],
  },
  name_cz: {
    type: String,
    required: [true, "need some value"],
  },
  note: String,
  starred: Boolean,
  learnt: Boolean,
  date: Date,
  category: [categorySchema]
});
const Item = new mongoose.model("Item", itemsSchema); //creating a new "item" model

//----------------------------------------------------------------
app.get("/", function (req, res) {  // on homepage
  Item.find({}) // if there is empty collection in the DB, then create 3 default items in the vocabulary
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        const wort1 = new Item({ name_de: "1. wort", name_cz: "1. slovo", note: "note", starred: false, learnt: false, date: new Date() }); // creating new instance (document) of the Item model - first TODO items
        const wort2 = new Item({ name_de: "2. wort", name_cz: "2. slovo", note: "note", starred: false, learnt: false, date: new Date() }); 
        const wort3 = new Item({ name_de: "3. wort", name_cz: "3. slovo", note: "note", starred: false, learnt: false, date: new Date() });

        const defaultItems = [wort1, wort2, wort3]; // setting default items

        Item.insertMany(defaultItems); // inserting the default items from array to DB

        res.redirect("/"); // after creating and saving default TODO items in DB redirecting to homepage... it will then get to the "else" statement below and render the default items
      } else {
        res.render("list", { listTitle: "Title", newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
  
  Category.find({})
    .then(function (foundCategories) {
      if (foundCategories.length === 0) {
        const category1 = new Category({ name: "1. category" });
        const category2 = new Category({ name: "2. category" });
        const category3 = new Category({ name: "3. category" });
        
        const defaultCategories = [category1, category2, category3];

        Category.insertMany(defaultCategories);

        res.redirect("/"); // after creating and saving default categories in DB redirecting to homepage... it will then get to the "else" statement below and render the default categories
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;

  const item = new Item({ name: itemName });
  item.save();

  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId).catch((err) => {
    console.log(err);
  });

  res.redirect("/");
});

/* app.get("/:listName", (req, res) => {
  const listName = req.params.listName;

  const x = List.findOne({ name: listName });
  const y = x.name;
  if (y.length === 0) {
    const list = new List({
      name: listName,
    });

    list.save();
  }

  console.log(x);
}); */

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
