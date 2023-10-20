// inicialisation of required packages
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const mongoose = require("mongoose");

//----------------------------------------------------------------

// connecting database, initializing mongoose schema and creating model

mongoose.connect("mongodb://127.0.0.1:27017/vocabulary");

// CATEGORY SCHEMA
const categorySchema = new mongoose.Schema({ // creating a new schema for categories
  name: String
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
        res.render("list", { newListItems: foundItems });
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
      res.render("list", {categories: foundCategories });
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  const word_de = req.body.word_de;
  const word_cz = req.body.word_cz;
  const category = req.body.category;
  const note = req.body.note;
  const item = new Item({ name_de: word_de, name_cz: word_cz, category: {name: category}, note: note, starred: false, learnt: false, date: new Date() });

  item.save();

  res.redirect("/");

});

app.post("/check", (req, res) => {
  const checkedItemId = req.body.checkbox;
    Item.findByIdAndUpdate(checkedItemId, { $set: { starred: true } }).catch((err) => {
      console.log(err);
    });

  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const deleteItemId = req.body.delete;

  Item.findByIdAndRemove(deleteItemId).catch((err) => {
    console.log(err);
  });

  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
