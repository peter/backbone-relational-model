# Backbone RelationalModel

## Introduction

This is a simplistic script that extends Backbone.Model to allow your models to manage has-many associations.

## Usage

```
window.Blog = RelationalModel.extend({
  urlRoot: '/blogs',
  idAttribute: "blog_id",
  associations: {
    posts: Posts
  }
});

window.Posts = Backbone.Collection.extend({
  url: '/posts',
  model: Post
});

blog = new Blog({name: "My Story"});
post = new Post({title: "Hello world!"});
post.save({}, {success: function() {
  blog.get("posts").add(post);
  blog.save();  
}});
```

In the associations hash you specify the collection class and you can also provide an options hash with the
attributes silent (to not trigger change events on association changes) and model (for the model class to 
instantiate in your collection, defaults to the model class specified by the collection). 

```
window.Blog = RelationalModel.extend({
  urlRoot: '/blogs',
  idAttribute: "blog_id",
  associations: {
    posts: [Backbone.Collection, {model: Post, silent: true}]
  }
});

If model/collection classes needed in the associations hash are not loaded yet you can wrap the declaration in
a function:

```
window.Blog = RelationalModel.extend({
  urlRoot: '/blogs',
  idAttribute: "blog_id",
  associations: function() {
    return {
      posts: [Backbone.Collection, {model: Post, silent: true}]
    };
  }
});
```

When doing a create/update it's up to the backend to connect the model with its associations. Similarly, when
doing a fetch on a model or an association, it's up the backend to return the models associations. If, for example when fetching a whole collection, an association is not returned by the backend then that association will be undefined and it will not be passed back to the backend on any subsequent update. This is in order to allow updating attributes of models in a collection eventhough associations are not loaded (or only partially loaded). It relies on the backend being able to distinguish between an associated collection being undefined (which means the client doesn't know about it) and it being empty (which means it should be cleared).

## License

This library is released under the MIT license.

## Resources

* [Stackoverflow: Backbone.js and Embedded One-To-Many Associations](http://stackoverflow.com/questions/9244375/backbone-js-and-embedded-one-to-many-associations)
* [Backbone-relational](https://github.com/PaulUithol/Backbone-relational). I find Backbone-relational to be too large and to patch Backbone too heavily, at least if your association needs are limited.
