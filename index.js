const mongoose = require("mongoose")
const connection_url = "mongodb://0.0.0.0:27017/playground"

mongoose
  .connect(connection_url)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err))

// define schema
const containerSchema = new mongoose.Schema({
  logistics_company: String,
  contains: [String],
  max_weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
})

const Container = mongoose.model("Container", containerSchema)
const container = new Container({
  logistics_company: "Maersk",
  contains: ["Linen", "Cotton", "Polyester"],
  max_weight: 720,
  dimensions: {
    length: 10,
    width: 4,
    height: 4,
  },
})


Container.find(
  {
    logistics_company: "Maersk",
    max_weight: { $gt: 750 }, 
  }
)
  .then(containers => console.log(containers))