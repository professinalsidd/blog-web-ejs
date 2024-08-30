//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent =
  "Here you can upload Daily good thoughts, nature thoughts, education thoughts, and all knowledgeable post you can write here otherwise your blog post we will be deleted up to 12 hours so don't wrong content and make your good post readable and if you don't dare to write a post don't write is optional you can skip read-only fun blog post thank you. ";
const aboutContent =
  "Hello, guys Welcome to Read & write a blog post. I have done this project for public use to a writing blog and made an interested a new repository and Read a daily update blog in R&W. Thanks for visited 😎 This is my Instagram profile sidd.jain.90 follow me.";

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.set("view engine", "ejs");

//conneting mongoose
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    appName: "Cluster0",
    ssl: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    if (err.name === "MongoNetworkError") {
      console.error("Network error occurred:", err);
    } else if (err.name === "MongoParseError") {
      console.error("URI format error occurred:", err);
    } else if (err.name === "MongoServerError") {
      console.error("Server error occurred:", err);
    }
  });

// creating schema
const schema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const usersSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Posts = mongoose.model("posts", schema);

// creating users collection
const Users = mongoose.model("user", usersSchema);

app.get("/", function (req, res) {
  // fetching the post from mongodb
  Posts.find({}, function (err, foundPost) {
    // checking the error
    if (!err) {
      // post was found succesfully
      // now render the post
      res.render("home", {
        homeStartingContent: homeStartingContent,
        posts: foundPost,
      });
    } else {
      // there was an error
      console.log(err);
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent,
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    info: "Write Your information",
  });
});

app.post("/contact", (req, res) => {
  // saving users in the mongodb
  new Users({
    firstName: req.body.fname,
    lastName: req.body.lname,
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message,
  }).save(function (err) {
    if (!err) {
      // user was saved successfully
      res.render("contact", {
        info: "Message seccessfully sent, i'll contact you soon",
      });
    } else {
      // there was an error
      console.log(`there was an error : ${err}`);
      res.render("contact", {
        info: "there was an error, please try again",
      });
    }
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  new Posts({
    title: req.body.postTitle,
    content: req.body.postBody,
  }).save();
  res.redirect("/");
});

app.get("/posts/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  // fetching the posts
  Posts.find(
    {
      title: req.params.postName,
    },
    function (err, foundPost) {
      //checking the error
      if (!err) {
        // post found successfully
        const [post] = foundPost;
        res.render("post", {
          title: post.title,
          content: post.content,
        });
      } else {
        // there was an error
        console.log(err);
      }
    }
  );
});

app.get("/secret/sidd/messages", (req, res) => {
  Users.find({}, (err, foundUsers) => {
    if (!err) {
      res.render("messages", {
        messages: foundUsers,
      });
    } else {
      res.send("There was error, please try again");
    }
  });
});

app.post("/delete", (req, res) => {
  Users.findByIdAndDelete({ _id: req.body.id }, (err) => {
    if (!err) {
      res.redirect("/secret/sidd/messages");
    } else {
      res.send(`there was an error : ${err}`);
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
