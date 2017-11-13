// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
  var Todo = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false,
        notes: "...",
        createdDate: new Date(),
        lastModifiedDate: new Date()
      };
    },

    // Ensure that each todo created has `title` and `notes`.
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
      if (!this.get("notes")) {
        this.set({"notes": this.defaults().notes});
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  // Todo Collection
  // ---------------

  // The collection of todos is backed by *localStorage* instead of a remote
  // server.
  var TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    },

    // Filter todos by title and description
    filterBy: function(keyword) {
      return this.filter(function (todo) { 
        return (todo.get('title').toLowerCase().indexOf(keyword.toLowerCase()) > -1 || 
                todo.get('notes').toLowerCase().indexOf(keyword.toLowerCase()) > -1);
      });
    }
  });

  // Create our global collection of **Todos**.
  var Todos = new TodoList;

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"   : "toggleDone",
      "click .btnEdit"  : "edit",
      "click button.destroy" : "clear",
      "click .js-btnSave"  : "updateOnClick",
      "click .js-btnCancel"  : "cancelOnClick",
      "keypress .edit": "updateOnEnter"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));

      this.input = this.$('.js-titleInput');
      this.textarea = this.$('.js-notesInput');

      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();

      var actionChannel = this.model.get("done") ? ActionChannel.COMPLETE : ActionChannel.INCOMPLETE;
      Mediator.publish(actionChannel, {
          'action': actionChannel, 
          'task': this.model.toJSON()
      });
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      var $parent = this.$el.closest('li');
      $parent.siblings('.editing').removeClass('editing');
      $parent.addClass("editing");
      
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      var notes = this.textarea.val();
      
      if(notes.length > 0 && !Validation.isAlphanumeric(notes)) {
        alert('Only allow number and characters');
        return;
      }
      if(!Validation.isValidLength(notes, 140)) {
        alert('Max 140 characters');
        return;
      }
      var cleanText = Sanitizer.truncateWord(Sanitizer.removeExtraSpaces(notes), MAX_NOTES_LENGTH);
      if (!value) {
        this.clear();
      } else {
        this.model.save({
          title: value, 
          notes: cleanText, 
          lastModifiedDate: new Date()
        });
        
        Mediator.publish(ActionChannel.UPDATE, {
          'action': ActionChannel.UPDATE,
          'task': this.model.toJSON()
        });

        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnClick: function(e) {
      this.close();
    },

    cancelOnClick: function(e) {
      this.$el.removeClass("editing");
    },
    
    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();

      Mediator.publish(ActionChannel.DELETE, {
        'action': ActionChannel.DELETE, 
        'task': this.model.toJSON()
      });
    }

  });


  // The DOM element for a activity item...
  var ActivityView = Backbone.View.extend({

    //... is a list tag.
    tagName: "li",

    // Cache the template function for a single item.
    template: _.template($('#activities-template').html()),

    // The DOM events specific to an item.
    events: {},

    initialize: function () {},

    // Re-render the activity item.
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click #btnAdd":  "createOnClick",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete",
      "keyup #txtFilter": "filterOnPress",
      "click #btnExpand": "toggleOnClick",
      "click #btnCancel": "toggleOnClick",
      "keypress .ts-input-box" : "createOnEnter",
      "keypress #notes" : "disabledEnter",
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-todo");
      this.textarea = this.$("#notes");
      this.filterInput = this.$("#txtFilter");
      this.allCheckbox = this.$("#toggle-all")[0];

      /*Auditing Service*/
      var auditor = new AuditingService();
      this.auditLogs = auditor.getAuditLogs();

      //Subscribe to channels
      Mediator.subscribe(ActionChannel.CREATE, auditor, auditor.update);
      Mediator.subscribe(ActionChannel.UPDATE, auditor, auditor.update);
      Mediator.subscribe(ActionChannel.DELETE, auditor, auditor.update);
      Mediator.subscribe(ActionChannel.COMPLETE, auditor, auditor.update);
      Mediator.subscribe(ActionChannel.INCOMPLETE, auditor, auditor.update);
      /*End auditing service*/

      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'all', this.render);

      this.listenTo(this.auditLogs, 'add', this.addLog);
      this.listenTo(this.auditLogs, 'all', this.updateActivity);
      
      this.footer = this.$('footer');
      this.main = this.$('#main');
      this.activityList = this.$("#activity-list");
      this.noResult = this.$('.ts-no-result');

      Todos.fetch();
      this.auditLogs.fetch();

      this.noResult.text('Hurray, no task!');
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;
      
      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
        
      } else {
        this.main.hide();
        this.footer.hide();
      }

      this.$el.attr('data-tasks', Todos.length);
      this.allCheckbox.checked = !remaining;
    },

    updateActivity: function() {
      var totalActivity = this.auditLogs.length;
      
      if(totalActivity > 0) {
        this.activityList.parent().addClass('show');
      }
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },
    
    addLog: function(log) {
      var view = new ActivityView({model: log});
      this.activityList.prepend(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      Todos.each(this.addOne, this);
    },

    // Add all items in the **Todos** collection at once.
    addAllLogs: function() {
      this.auditLogs.each(this.addLog, this);
    },

    handleCreateTask: function() {
      if (!this.input.val()) return;
      var notes = this.textarea.val();
      if(notes.length > 0 && !Validation.isAlphanumeric(notes)) {
        alert('Only allow number and characters');
        return;
      }
      if(!Validation.isValidLength(notes, 140)) {
        alert('Max 140 characters');
        return;
      }
      var cleanText = Sanitizer.truncateWord(Sanitizer.removeExtraSpaces(notes), MAX_NOTES_LENGTH);
      
      var newTask = Todos.create({
        title: this.input.val(),
        notes: cleanText
      });
      
      Mediator.publish(ActionChannel.CREATE, {
        'action': ActionChannel.CREATE, 
        'task': newTask.toJSON()
      });

      this.input.val('');
      this.textarea.val('');
      this.$el.removeClass('add-task');
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnClick: function(e) {
      this.handleCreateTask();
    },

    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      this.handleCreateTask();
    },
    // Disabled enter in textarea
    disabledEnter: function(e) {
      if (event.keyCode == 13) {event.preventDefault();}
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    },

    toggleOnClick: function() {
      if(this.$el.hasClass('add-task')) {
        this.$el.removeClass('add-task');

        this.input.val('');
        this.textarea.val('');
      }else {
        this.input.focus();
        this.$el.addClass('add-task');
        this.$el.find('.editing').removeClass('editing');
      }
    },

    filterOnPress: _.debounce(function() {
        var parentView = this;
        var keyword = this.filterInput.val();
        var filterdList = this.filterInput.val().length >= 3 ? Todos.filterBy(keyword) : Todos;

        parentView.$('#todo-list').empty();
        filterdList.forEach(function(item) {
          parentView.addOne(item);
        });

        if(filterdList.length === 0) {
          this.noResult.text('No result found.').show();
        }else {
          this.noResult.hide();
        }
    }, 300)
  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});

// Simple date formatting
function formatDate(val) {
  if(moment(val).diff(new Date(), 'days') === 0) {
    return 'Today';
  }
  return moment(val).format('D MMM YY');
}

function formatLastModifiedDate(val) {
  return moment(val).fromNow();
}