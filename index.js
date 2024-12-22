"use strict";
var http = require("http");
var port = process.env.PORT || 5051;
var express = require("express");
var app = express();
var path = require("path");
const multer = require("multer");
const session = require("express-session");
app.use(express.json());
var HTMLPath = path.join(__dirname, "html files");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "html files")));
app.use("/css files",express.static(path.join(__dirname, "views", "css files"), {type: "text/css",}));
app.use("/img", express.static(path.join(__dirname, "img")));
const connect = require("./database.js");
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

app.post("/api/update-profile", upload.single("profilePicture"), (req, res) => {
  const { bio } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  res.json({ message: "Profile updated successfully" });
});

app.set("view engine", "ejs");

app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "index.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "about.html"));
});
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "contact.html"));
});
app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "menu.html"));
});
app.get("/reservation", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "reservation.html"));
});
app.get("/service", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "service.html"));
});
app.get("/processContactUS", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "processContactUS.html"));
});
app.get("/testimonial", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "testimonial.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "html files", "login.html"));
});

app.post("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/index.html");
});

app.get("/preOrderItems", async (req, res) => {
  try {
    const searchQuery = req.body.searchInput;
    const searchResults = await connect.searchProducts(searchQuery);

    res.render("preOrderItems", { searchResults });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use((req, res, next) => {
  req.session.shoppingCart = req.session.shoppingCart || [];
  next();
});

app.post("/addtoCart", async (req, res) => {
  console.log("Received POST request to /addtoCart");
  console.log(req.body);
  const productId = req.body.productId;
  console.log(productId);
  const quantity = parseInt(req.body.quantity, 10);

  try {
    const item = await connect.getItemById(connect.con, productId);

    if (!item) {
      console.error("Item not found for ID:", productId);
      return res.status(404).json({ message: "Item not found" });
    }
    console.log("Item found:", item);

    const existingItemIndex = req.session.shoppingCart.findIndex(
      (cartItem) => cartItem.MenuItemID === productId
    );

    if (existingItemIndex !== -1) {
      req.session.shoppingCart[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        MenuItemID: item.MenuItemID,
        quantity: quantity,
        ItemName: item.ItemName,
        price: item.Price,
      };
      req.session.shoppingCart.push(newItem);
    }

    res.json({
      message: "Item added to cart successfully",
      shoppingCart: req.session.shoppingCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

app.post("/checkout", async (req, res) => {
  try {
    const userId = req.session.user.id;
    const order = await connect.saveOrderToDatabase(
      userId,
      req.session.shoppingCart
    );

    req.session.shoppingCart = [];
    res.redirect("/");
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/viewCart", (req, res) => {
  res.render("viewCart", { shoppingCart: req.session.shoppingCart });
});

app.post("/verifyUser", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  connect.con.query(
    "SELECT * FROM users WHERE email = ? AND pass = ?",
    [email, password],
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(500).send("Error checking username");
      } else {
        if (result.length > 0) {
          res.send("Login successful");
          const user = {
            id: result[0].UserID,
            email: result[0].Email,
            firstName: result[0].FirstName,
            lastName: result[0].LastName,
            password: result[0].Pass,
            image: result[0].image_path,
            description: result[0].description,
          };
          req.session.user = user;
          req.session.save();
          console.log("Session Data after login:", req.session.user);
        } else {
          res.send("Login unsuccessful");
        }
      }
    }
  );
});

app.get("/profile", (req, res) => {
  const userData = req.session.user;

  if (!userData) {
    return res.redirect("/login");
  }
  console.log("Session Data:", userData.firstName);
  res.render("profile", {
    img_path: userData.image || "img/empty-image.png",
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
  });
});

app.post("/processCreateAccount", (req, res) => {
  const FirstName = req.body.firstName;
  const LastName = req.body.lastName;
  const Email = req.body.email;
  const Pass = req.body.password;

  connect.con.query(
    "INSERT INTO users (FirstName, LastName, Email, Pass) VALUES (?,?,?,?);",
    [FirstName, LastName, Email, Pass],
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("User inserted successfully");
        res.redirect("/login");
      }
    }
  );
});

app.post("/processReservation", (req, res) => {
  if (req.session.user == null) {
    res.send("you need to login first");
  } else {
    const name = req.body.name;
    const time1 = req.body.time1;
    const date1 = req.body.date1;
    const number = req.body.number;
    const numboff = req.body.numbof;

    connect.con.query(
      "INSERT INTO reservations (username, user_number, rdate, rtime, NumberofPersons) VALUES (?,?,?,?,?);",
      [name, number, date1, time1, numboff],
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Reservation inserted successfully");
        }
      }
    );
    res.redirect("/preOrderItems");
  }
});

app.post("/processContactUs", (req, res) => {
    const name=req.body.name;
    const email=req.body.email;
    const subject=req.body.subject;
    const message=req.body.message;

    connect.con.query("INSERT INTO contactus (username, email, subjectt, message) VALUES (?,?,?,?);", [name, email, subject, message], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("contactus inserted successfully");
            res.redirect("/");
        }
    });
});

app.post("/updateProfile", (req, res) => {
  const userData = req.session.user;

  if (!userData) {
    return res.redirect("/login");
  }

  const { firstName, lastName, email, password } = req.body;
  const ProfileImage = "img/" + req.body.profilePicture;
  console.log(ProfileImage);

  req.session.user = {
    ...userData,
    firstName,
    ProfileImage,
    lastName,
    email,
    password,
  };

  const updateQuery =
    "UPDATE users SET FirstName = ?, LastName = ?, Email = ?, Pass = ?, image_path = ? WHERE Userid = ?";
  const values = [
    firstName,
    lastName,
    email,
    password,
    ProfileImage,
    userData.id,
  ];

  connect.con.query(updateQuery, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error updating profile");
    }
    console.log("Profile updated in the database");
    res.render("profile", {
      img_path: ProfileImage || "img/empty-image.png",
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });
  });
});

app.get("/survey", (req, res) => {
  const user = req.session.user || null;
  const surveyData = req.session.surveyData || {};
  res.render("survey", { user, surveyData });
});

app.post("/submit-survey", async (req, res) => {
  const userId = req.session.user.id;
  const surveyId = Math.floor(Math.random() * 929);
  const results = req.body;

  connect.con.query(
    "INSERT INTO surveys (survey_id, userid, date_submitted) VALUES (?,?,NOW());",
    [surveyId, userId],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      } else {
        console.log("survey inserted successfully");
      }
    }
  );

  for (let i = 1; i <= 7; i++) {
    const answer = results[`question${i}`];
    connect.con.query(
      "INSERT INTO surveyinfo (survey_id, question_id, option_name) VALUES (?,?,?);",
      [surveyId, i, answer],
      function (err, result) {
        if (err) {
          console.log(err);
          errorOccurred = true;
        } else {
          console.log("answer inserted successfully");
        }
      }
    );
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
