// This class extends Backbone.Model with simplistic support for has-many associations.
// For specified associations, JavaScript arrays fetched from the server will be initialized
// as Backbone Collections. Example usage:
//
// window.Blog = RelationalModel.extend({
//   urlRoot: '/blogs',
//   idAttribute: "blog_id",
//   associations: {
//     posts: Posts
//   }
// });
// 
// window.Posts = Backbone.Collection.extend({
//   url: '/posts',
//   model: Post
// });
// 
// blog = new Blog({name: "My Story"});
// post = new Post({title: "Hello world!"});
// post.save({}, {success: function() {
//   blog.get("posts").add(post);
//   blog.save();  
// }});
//
// In the associations hash you specify the collection class and you can also provide an options hash with the
// attributes silent (to not trigger change events on association changes) and model (for the model class to 
// instantiate in your collection, defaults to the model class specified by the collection). 
//
// window.Blog = RelationalModel.extend({
//   urlRoot: '/blogs',
//   idAttribute: "blog_id",
//   associations: {
//     posts: [Backbone.Collection, {model: Post, silent: true}]
//   }
// });
//
// If model/collection classes needed in the associations hash are not loaded yet you can wrap the declaration in
// a function:
//
// window.Blog = RelationalModel.extend({
//   urlRoot: '/blogs',
//   idAttribute: "blog_id",
//   associations: function() {
//     return {
//       posts: [Backbone.Collection, {model: Post, silent: true}]
//     };
//   }
// });
//
// When doing a create/update it's up to the backend to connect the model with its associations. Similarly, when
// doing a fetch on a model or an association, it's up the backend to return the models associations. If, for example when
// fetching a whole collection, an association is not returned by the backend then that association
// will be undefined and it will not be passed back to the backend on any subsequent update. This is in order
// to allow updating attributes of models in a collection eventhough associations are not loaded (or only partially loaded).
// 
// Inspired partially by https://github.com/PaulUithol/Backbone-relational
// Motivated by the fact that I find Backbone-relational to be too large and to patch Backbone too heavily,
// at least if your association needs are limited.
window.RelationalModel = Backbone.Model.extend({
  set: function(key, value, options) {
    var attrs,
      isNew,
      associations;      
    // This argument parsing code is from the Backbone.Model.set method
    if (_.isObject(key) || key == null) {
      attrs = key;
      options = value;
    } else {
      attrs = {};
      attrs[key] = value;
    }
    isNew =  (this.isNew() && !attrs[this.idAttribute]);
    associations = (_.isFunction(this.associations) ? this.associations() : this.associations);
    for (name in associations) {
      if (attrs[name] || (isNew && !this.attributes[name])) {
        attrs[name] = this.initializeAssociation(attrs[name], associations[name]);
      }
    }
    return Backbone.Model.prototype.set.apply(this, [attrs, options]);
  },

  initializeAssociation: function(items, association) {
    var collection,
      collectionType,
      options = {},
      modelType;
    if (_.isFunction(association)) {
      collectionType = association; // posts: Posts
    } else {
      collectionType = association[0]; // posts: [Posts, {model: Post, silent: true}]
      options = association[1];
    }
    items || (items = []);
    modelType = options.model || collectionType.prototype.model;
    items = _.map(items, function(i) { return new modelType(i) });
    collection = new collectionType(items);
    if (!options.silent) this.bindAssociation(collection);
    return collection;
  },

  bindAssociation: function(collection) {
    var triggerChange = function() {
      this.trigger("change");
    };
    collection.bind('add', triggerChange, this);
    collection.bind('remove', triggerChange, this);
    collection.bind('change', triggerChange, this);
    collection.bind('reset', triggerChange, this);
   }
});
