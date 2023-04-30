const bcrypt = require("bcrypt")

async function generateSalt() {
  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash("colorcode", salt)
  console.log(`🧂 Salt: ${salt}`)
  console.log(`🔑 Hashed: ${hashed}`)
}

generateSalt()
