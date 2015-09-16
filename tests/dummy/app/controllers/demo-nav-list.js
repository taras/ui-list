import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line

export default Ember.Controller.extend({
  flashMessages: Ember.inject.service(),

  queryParams: ['mood','size','skin','position'],

  items: [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer'}),
    Ember.Object.create({when: 5, foo: 'Took Cab', bar: 'took a cab, drinking not driving', icon: 'cab'}),
  ],
  widgetWidth: computed('position', function(){
    return new A(['top','bottom']).contains(this.get('position')) ? 'full' : 'wide';
  }),
  emberItems: [
    {foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'cutlery', badge: 6},
    {foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 1},
    {foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer'},
    {foo: 'Took Cab', bar: 'took a cab, drinking not driving', icon: 'cab'},
    {foo: 'Had Coffee', bar: 'need to chill out after that beer', icon: 'coffee'}
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
  sortOrders: [
    {name: 'Natural', id: null},
    {name: 'When', id: 'when'},
    {name: 'Badges', id: 'badge'},
    {name: 'Title', id: 'title'}
  ],
  sortAscending: true,
  moodStrategy: 'static',
  enableStaticChooser: on('init',computed('moodStrategy', function() {
    return this.get('moodStrategy') === 'static';
  })),
  listFilter: computed('isFiltered', function() {
    const FilterFunc = item => { return item.badge > 0; };
    return this.get('isFiltered') ? FilterFunc : null;
  }),

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
  mood: 'default',
  skin: 'default',
  size: 'default',
  compressed: false,
  defaultIcon: 'envelope',
  actions: {
    onSelect: function(action, item) {
      const flashMessages = Ember.get(this, 'flashMessages');
      flashMessages.success(`onSelect Event: ${action} on ${item.elementId}`);
    },
    onError: function(code, item) {
      const flashMessages = Ember.get(this, 'flashMessages');
      const title = Ember.get(item, 'title');
      flashMessages.warning(`onError event: ${code} when interacting with "${title}"`);
    }
  },
  min: 0,
  max: 1


});
