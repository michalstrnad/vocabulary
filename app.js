// inicialisation of required packages
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoose = require("mongoose");
//---------------

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  // creating a new schema for list items
  name: {
    type: String,
    required: [true, "need some value"],
  },
});

const Item = new mongoose.model("Item", itemsSchema); //creating a new "item" model

const listSchema = new mongoose.Schema({
  // creating a new schema for lists
  name: {
    type: String,
    required: [true, "need a name"],
  },
  items: [itemsSchema],
});

const List = new mongoose.model("List", listSchema); //creating a new "list" model

app.get("/", function (req, res) {
  // on homepage
  Item.find({}) // if there is empty collection in the DB, then create 3 default items in the list
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        const todo1 = new Item({ name: "4 todo item" }); // creating new instance (document) of the Item model - first TODO items
        const todo2 = new Item({ name: "5 todo item" });
        const todo3 = new Item({ name: "6 todo item" });

        const defaultItems = [todo1, todo2, todo3]; // setting default items

        Item.insertMany(defaultItems); // inserting the default items from array to DB

        res.redirect("/"); // after creating and saving default TODO items in DB redirecting to homepage... it will then get to the "else" statement below and render the default items
      } else {
        res.render("list", { listTitle: "Title", newListItems: foundItems });
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

app.get("/:listName", (req, res) => {
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

  /*   Item.find({})
    .then(function (foundItems) {
      res.render("list", { listTitle: listName, newListItems: foundItems });
    })
    .catch(function (err) {
      console.log(err);
    }); */
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
