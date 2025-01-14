import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line


export default Ember.Controller.extend({

  queryParams: ['mood','size','style','compressed'],

  items: [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer'}),
    Ember.Object.create({when: 5, foo: 'Took Cab', bar: 'took a cab, drinking not driving', icon: 'cab'}),
    Ember.Object.create({when: 6, foo: 'Had Coffee', bar: 'need to chill out after that beer', icon: 'coffee'}),
    Ember.Object.create({when: 1, foo: 'Ate Breakfast', bar: 'start of every good morning', icon: 'cutlery'})
  ],
  map: {
    title: 'foo',
    subHeading: 'bar'
  },
  sillyLogic: function(item) {
    let badge = item.get('badge');
    let moodiness = badge && badge > 5 ? 'error' : 'warning';
    return badge ? moodiness : null;
  },

  listFilter: computed('isFiltered', function() {
    const FilterFunc = item => { return item.badge > 0; };
    return this.get('isFiltered') ? FilterFunc : null;
  }),
  moodStrategy: 'static',
  enableStaticChooser: on('init',computed('moodStrategy', function() {
    return this.get('moodStrategy') === 'static';
  })),


  toggledBadge: on('init',computed('showBadge', function() {
    return this.get('showBadge') ? 4 : null;
  })),
  showBadge: true,
  showIcon: true,
  showSubHeading: true,
  toggledIcon: on('init',computed('showIcon', function() {
    return this.get('showIcon') ? 'envelope' : null;
  })),
  toggledSubHeading: on('init',computed('showSubHeading', function() {
    return this.get('showSubHeading') ? 'ran 12mi in London' : null;
  })),
  skin: 'default',
  size: 'default',
  compressed: false,
  defaultIcon: 'envelope',
  itemsNew: null,

  actions: {
    onUpdate(action, info) {
      const flashMessages = Ember.get(this, 'flashMessages');
      const titles = new A(info.new).mapBy('foo').join(', ');
      flashMessages.success(`onChange Event: ${action}; element dragged was "${info.dragged.foo}". Order now: ${titles}`);

      this.set('items', info.new);
    },
    onClick(item, options) {
      const flashMessages = Ember.get(this, 'flashMessages');
      flashMessages.success(`onClick Event. Pane was ${options.pane}; item originating was ${item.elementId} ... "${item.get('title')}"`);
    }
  }

});
