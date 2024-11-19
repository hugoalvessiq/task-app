// index.js
const { default: mongoose } = require("mongoose");
const app = require("./server");
const PORT = process.env.PORT || 3500;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server runing on port ${PORT}`);
  });
});
