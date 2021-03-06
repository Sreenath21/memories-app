import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPost = async (req, res) => {
  const { id: _id } = req.params;
  try {
    const post = await PostMessage.findById(_id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await PostMessage.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  try {
    const newPost = new PostMessage({
      ...post,
      creator: req.userId,
      createdAt: new Date().toISOString(),
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json(error);
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No post with the ID is found on db");

    const updatedPost = await PostMessage.findByIdAndUpdate(
      _id,
      { ...post, _id },
      { new: true }
    );
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const deletePost = async (req, res) => {
  const { id: _id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No post with the ID is found on db");

    await PostMessage.findByIdAndRemove(_id);

    console.log("post deleted");
    res
      .status(200)
      .json({ message: `Post with Id ${_id} deleted successfully` });
  } catch (error) {
    res.status(404).json(error);
  }
};

export const likePost = async (req, res) => {
  const { id: _id } = req.params;

  if (!req.userId) return res.status(401).json({ message: "unauthenticated" });

  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No post with the ID is found on db");

    const post = await PostMessage.findById(_id);

    const index = post.likes.findIndex((_id) => _id === String(req.userId));

    if (index === -1) {
      // like post
      post.likes.push(req.userId);
    } else {
      // dislike post
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
      new: true,
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(404).json(error);
  }
};
