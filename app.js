const express = require("express")
const mongoose = require("mongoose")
const _ = require("lodash")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// import middleware
const { auth } = require("./middleware/auth")
const { admin } = require("./middleware/admin")

// gaurd against missing env variables
if (!process.env.JWT_SECRET) {
  console.error("❗FATAL ERROR: JWT_SECRET is not defined.")
  process.exit(1)
}

const app = express()
app.use(express.json())
const connection_url = "mongodb://0.0.0.0:27017/playground"

mongoose
  .connect(connection_url)
  .then(() => console.log("🎉 Connected to MongoDB"))
  .catch(err => console.log(err))

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: Boolean,
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, isAdmin: this.isAdmin },
    process.env.JWT_SECRET
  )
  return token
}

const User = mongoose.model("User", userSchema)

app.get("/", (req, res) => {
  res.send("👟 Up and running")
})

app.get("/protected", auth, (req, res) => {
  res.send("🗝️ Access granted")
})

app.get("/admin", [auth, admin], (req, res) => {
  res.send("👮‍♂️ Admin access granted")
})

app.post("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")
  res.send(user)
})

app.post("/api/user", async (req, res) => {
  const user = new User(_.pick(req.body, ["name", "email", "password"]))

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)

  user
    .save()
    .then(() => {
      const token = user.generateAuthToken()
      res
        .header("x-auth-token", token)
        .send(_.pick(user, ["_id", "name", "email"]))
    })
    .catch(err => res.status(500).send(err))
})

app.post("/api/auth", async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(400).send("Invalid credentials")
  }

  const isValidPassword = await bcrypt.compare(req.body.password, user.password)

  if (!isValidPassword) res.send("🚫 Access denied")

  const token = user.generateAuthToken()
  res.send(token)
})

const port = process.env.PORT || 3000

app.listen(port, () =>
  console.log(`🚀 Server live on http://localhost:${port}`)
)
