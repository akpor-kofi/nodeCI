const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const clearCache = require("../middlewares/clearCache");

const db = mongoose.connection;
db.once("open", () => {
  console.log("Db is connected");
  const blogStream = db.collection("blogs").watch();

  blogStream.on("change", (change) => {
    console.log("your collection has been updated");
  });
});

const Blog = mongoose.model("Blog");

module.exports = (app) => {
  app.get("/api/blogs/:id", requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id,
    });

    res.send(blog);
  });

  app.get("/api/blogs", requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id,
    });
    res.send(blogs);

    //client.set(req.user.id, JSON.stringify(blogs));
  });

  app.post("/api/blogs", requireLogin, clearCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id,
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
