'use strict'

const _ = require('lodash')
const Post = require('./post.model')
const User = require('../user/user.model')
const Project = require('../project/project.model')

import { handleError } from '../lib/helpers'

/**
* @api {get} /api/posts/project/:projectId Show By Project
* @apiName showByProject
* @apiGroup BlogPost
* @apiDescription Get list of Blog Post
* @apiPermission public
* @apiSuccess {Collection} root Get the posts corresponding to a project
* @apiError (500) UnknownException Could not retrieve Blog Post collection
*/
exports.showByProject = (req, res) => {
  Post.find({ "projectId": req.params.projectId })
  .populate('author')
  .exec()
  .then((posts) => {
    return res.json(200, posts)
  })
  .catch((err) => {
    return handleError(res, err)
  })
}

/**
* @api {get} /api/posts Index
* @apiName index
* @apiGroup BlogPost
* @apiDescription Get list of Blog Posts
* @apiPermission public
* @apiSuccess {Collection} root Collection of all Observatory Blog Posts.
* @apiError (500) UnknownException Could not retrieve Blog Post collection
*/
exports.index = (req, res) => {
  // Empty query for Posts
  let query = {}

  // Scope query to a specific Project
  if (req.params.project) {
    query.project = req.params.project
  }

  // Queries Posts and returns result
  Post.find(query)
  .then((posts) => {
    return res.json(200, posts)
  })
  .catch((err) => {
    return handleError(res, err)
  })

}

/**
* @api {get} /api/posts/:id Show
* @apiName show
* @apiGroup BlogPost
* @apiDescription Get a single blog post
* @apiPermission public
* @apiSuccess {Collection} root Returns a single blog post
* @apiError (500) UnknownException Could not display Blog Post
*/
exports.show = (req, res) => {
  Post.findById(req.params.id)
  .populate('author')
  .exec((err, post) => {
    if (err) { return handleError(res, err) }
    if (!post) { return res.send(404) }
    return res.json(post)
  })
}

/**
* @api {post} /api/posts Create
* @apiName create
* @apiGroup BlogPost
* @apiDescription Creates a new post in the DB
* @apiPermission Authenticated
* @apiSuccess {Model} root The newly created blog post
* @apiError (500) UnknownException Could not create blog post
*/
exports.create = (req, res) => {
  req.body.author = req.user._id

  // remove date field if client tries to set it.
  delete req.body.date

  if (!req.body.projectId){
    return res.status(400).send("Project not set")
  }

  Project.findOne({ '_id': req.body.projectId })
  .then((project) => {

    // Short-circuit if no project is found matching the ID
    if (!project) {
      return res.status(404).send("Project not found")
    }
    // Only someone who is part of the project can write a blog post
    // TODO - replace callback with Promise
    User.findById(req.user._id)
    .then((user) => {
      if ((user.projects && user.projects.indexOf(project._id) !== -1) || user.role === 'mentor' || user.role === 'admin') {
        // TODO - replace callback with Promise
        Post.create(req.body)
        .then((post) => {
          return res.json(201, post)
        })
        .catch((err) => {
          res.status(403).send("User not part of project")
        })
      }
    })
    .catch((err) => {
      return handleError(res, err)
    })

  })
  .catch((err) => {
    return handleError(res, err)
  })

}

/**
* @api {put} /api/posts/:id Update
* @apiName update
* @apiGroup BlogPost
* @apiDescription Updates a single blog post
* @apiPermission Authenticated
* @apiSuccess {Model} root The updated blog post
* @apiError (500) UnknownException Could not update blog post
*/
exports.update = (req, res) => {
  // remove date field if client tries to set it.
  delete req.body.date

  if (req.body._id) { delete req.body._id }

  Post.findById(req.params.id)
  .then ((post) => {
    if (!post){ return handleError(res, err) }

    // Only the post's author, a mentor, or an admin can edit the post
    const userId = req.user._id

    // TODO - replace callback with Promise
    User.findById(userId)
    .then((user) => {

      if (userId.equals(post.author) || user.role === 'mentor' || user.role === 'admin'){
        const updated = _.merge(post, req.body)

        // Saves the updated post
        updated.save()
        .then(() => {
          return res.json(200, post)
        })
        .catch((err) => {
          return handleError(res, err)
        })

      } else {
        return handleError(res, err)
      }

    })
    .catch((err) => {
      return handleError(res, err)
    })

  })
  .catch((err) => {
    return handleError(res, err)
  })
}

/**
* @api {delete} /api/posts/:id Destroy
* @apiName destroy
* @apiGroup BlogPost
* @apiDescription Deletes a post from the DB.
* @apiPermission Authenticated
* @apiSuccess {Model} root The deleted blog post
* @apiError (500) UnknownException Could not delete Blog Post.
*/
exports.destroy = (req, res) => {

  Post.findById(req.params.id)
  .then((post) => {
    if (!post) { return res.send(404) }

    // Only the post's author, a mentor, or an admin can delete the post
    const userId = req.user._id

    User.findById(userId)
    .then((user) => {

      if (userId.equals(post.author) || user.role === 'mentor' || user.role === 'admin'){

        // Removes the blog post
        post.remove()
        .then(() =>{
          return res.status(204).json({ post }).end()
        })
        .catch((err)=>{
          return handleError(res, err)
        })
      }

    })
    .catch((err)=>{
      return handleError(res, err)
    })

  })
  .catch((err)=>{
   return handleError(res, err)
  })
}
