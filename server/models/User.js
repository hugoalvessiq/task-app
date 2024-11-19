const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

userSchema.pre("save", async function (next) {
  const user = this;

  user.name = user.name.toLowerCase();
  user.email = user.email.toLowerCase();

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

module.exports = mongoose.model("User", userSchema);
