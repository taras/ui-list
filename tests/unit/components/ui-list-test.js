import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug } = Ember;    // jshint ignore:line
import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ui-list', {
  // Specify the other units that are required for this test
  needs: ['component:ui-item','component:ui-icon']
});

test('items are enumerable', function(assert) {
  let component = this.subject();
  assert.ok(component.get('items').firstObject, 'even at initialization state, items should be enumerable');
  component.set('items', [ {when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1} ]);
  assert.ok(component.get('items').firstObject, 'a bare JS array should be fine');
  component.set('items', new A([ {when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1} ]));
  assert.ok(component.get('items').firstObject, 'an ember array passed in is ok');
});

test('items are observable', function(assert) {
  let component = this.subject({ignored: true});
  assert.ok(component.get('items').hasEnumerableObservers, "the items array should be observable");
  component.set('items', [
    Ember.Object.create({when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1}),
    Ember.Object.create({when: 3, foo: "Hospital", bar: "visit sick uncle Joe", icon: "ambulance", badge: 6}),
    Ember.Object.create({when: 4, foo: "Pub", bar: "it's time for some suds", icon: "beer"}),
    Ember.Object.create({when: 5, foo: "Took Cab", bar: "took a cab, drinking not driving", icon: "cab"}),
    Ember.Object.create({when: 6, foo: "Had Coffee", bar: "need to chill out after that beer", icon: "coffee"}),
    Ember.Object.create({when: 1, foo: "Ate Breakfast", bar: "start of every good morning", icon: "cutlery"})
  ]);
  assert.ok(component.get('items.0').hasObserverFor('foo'), "the foo property should be observed too");
  assert.ok(component.get('items.0').hasObserverFor('bar'), "the bar property should be observed too");
  assert.ok(component.get('items.0').hasObserverFor('badge'), "the badge property should be observed too");
  assert.ok(!component.get('items.0').hasObserverFor('foobar'), "the foobar property does not exist and now observation should");
  assert.ok(!component.hasObserverFor('ignored'), "the ignored property should be ignored because it was created before the object was created");
});

test('only valid filters are set', function(assert) {
  let component = this.subject();
  component.set('filter', ['when', 6 ]);
  assert.equal(
    JSON.stringify(component.get('_filter')),
    JSON.stringify(['when', 6 ]), 
    'a two element array should be considered valid'
  );
  component.set('filter', ['when', 6, 7 ]); // invalid syntax
  assert.notEqual(
    JSON.stringify(component.get('_filter')),
    JSON.stringify(['when', 6, 7 ]), 
    'a three element array should NOT be considered valid'
  );
  // valid object
  const validObject = {key: 'when', value: 6};
  component.set('filter', validObject); 
  assert.equal(
    JSON.stringify(component.get('_filter')),
    JSON.stringify(validObject), 
    'a valid key/value object should be fine as a filter'
  );
  // invalid object
  const invalidObject = {when: 6};
  component.set('filter', invalidObject); 
  assert.notEqual(
    JSON.stringify(component.get('_filter')),
    JSON.stringify(invalidObject), 
    'an invalid object should be ignored'
  );
  // scalars
  component.set('filter', 'this was a bad idea');
  assert.equal(component.get('_filter'),null, 'a string filter is invalid and ignored');
  component.set('filter', 5);
  assert.equal(component.get('_filter'),null, 'yeah right! a number? come on.');
});

test('content is set from items', function(assert) {
  let component = this.subject();
  component.set('items', [
    Ember.Object.create({when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1}),
    Ember.Object.create({when: 3, foo: "Hospital", bar: "visit sick uncle Joe", icon: "ambulance", badge: 6}),
    Ember.Object.create({when: 4, foo: "Pub", bar: "it's time for some suds", icon: "beer"}),
    Ember.Object.create({when: 5, foo: "Took Cab", bar: "took a cab, drinking not driving", icon: "cab"}),
    Ember.Object.create({when: 6, foo: "Had Coffee", bar: "need to chill out after that beer", icon: "coffee"}),
    Ember.Object.create({when: 1, foo: "Ate Breakfast", bar: "start of every good morning", icon: "cutlery"})
  ]);
  component.set('map', {
    title: 'foo',
    subHeading: 'bar'
  });
  assert.equal(component.get('items').length, component.get('content').length, "content and items should always be equal length");
  // validate simple property transfer
  assert.equal(
    component.get('items.0.foo'), 
    component.get('content.0.foo'), 
    "foo should remain unchanged"
  );
  assert.equal(
    component.get('items.0.badge'), 
    component.get('content.0.badge'), 
    "badge should remain unchanged"
  );
  // check new bindings
  assert.equal(
    component.get('content.0.foo'), 
    component.get('content.0.title'),
    "title should have taken property value of 'foo' and therefore be equal"
  );
  assert.equal(
    component.get('content.0.bar'), 
    component.get('content.0.subHeading'),
    "subHeading should have taken property value of 'bar' and therefore be equal"
  );
    
});

test('listProperties injected into content', function(assert) {
  let component = this.subject();
  component.set('items', [
    Ember.Object.create({when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1}),
    Ember.Object.create({when: 3, foo: "Hospital", bar: "visit sick uncle Joe", icon: "ambulance", badge: 6}),
  ]);
  component.set('size','large');
  assert.equal(component.get('size'), 'large', 'size listProperty set to large');
  component.set('style','flat');
  assert.equal(component.get('style'), 'flat', 'style listProperty set to flat');
  component.set('mood','success');
  assert.equal(component.get('mood'), 'success', 'mood listProperty set to success');
  assert.equal(component.get('content.0.size'), 'large', 'the size listProperty has been transferred over to the content array');
  assert.equal(component.get('content.0.style'), 'flat', 'the style listProperty has been transferred over to the content array');
  assert.equal(component.get('content.0.mood'), 'success', 'the mood listProperty has been transferred over to the content array');
});


test('inline business logic resolved', function(assert) {
  let component = this.subject();
  component.set('items', [
    {
      when: 2, 
      badge: 1,
      badgePlus: function(item) { return item.get('badge') + 1; }
    },
    {
      when: 3, 
      badge: 6,
      badgePlus: function(item) { return item.get('badge') + 1; }
    }
  ]);
  component.set('badgePlus', function(item) {
    return item.badge++;
  });
  assert.equal(
    component.get('content.0.badgePlus'),
    component.get('content.0.badge') + 1, 
    "the badgePlus property should have resolved to a discrete scalar"
  );
});

test('observing a new item', function(assert) {
  let component = this.subject();
  let done = assert.async();
  component.set('items', [
    Ember.Object.create({when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1}),
    Ember.Object.create({when: 3, foo: "Hospital", bar: "visit sick uncle Joe", icon: "ambulance", badge: 6}),
    Ember.Object.create({when: 4, foo: "Pub", bar: "it's time for some suds", icon: "beer"}),
    Ember.Object.create({when: 5, foo: "Took Cab", bar: "took a cab, drinking not driving", icon: "cab"}),
    Ember.Object.create({when: 6, foo: "Had Coffee", bar: "need to chill out after that beer", icon: "coffee"}),
    Ember.Object.create({when: 1, foo: "Ate Breakfast", bar: "start of every good morning", icon: "cutlery"})
  ]);
  let itemCount = component.get('items.length');
  component.somethingShallowChanged = computed('component.items.[]', function() {
    assert.equal(component.get('items.length'), itemCount + 1, 'detected the addition of a new item');
    run.cancel(later);
    done();
  });
  component.get('items').pushObject({foo: 'newbie'} );
  let later = run.later( () => {
    assert.equal(component.get('items.length'), itemCount + 1, 'detected the addition of a new item');
    assert.ok(false,"failed to observe the addition of a new item record");
    done();
  },25);
});


test('observing a property change in items', function(assert) {
  let done = assert.async();
  let component = this.subject();
  component.somethingDeepChanged = computed('items.@each._propertyChanged', function(property) {
    assert.equal('foo', property, 'the changed property foo was detected')
    run.cancel(later);
    done();
  });
  component.somethingShallowChanged = computed('items.[]', function() {
    assert.ok(true,'items were added or removed');
  });
  component.set('items', [
    Ember.Object.create({when: 2, foo: "Groceries", bar: "hungry, hungry, hippo", icon: "shopping-cart", badge: 1}),
    Ember.Object.create({when: 3, foo: "Hospital", bar: "visit sick uncle Joe", icon: "ambulance", badge: 6}),
    Ember.Object.create({when: 4, foo: "Pub", bar: "it's time for some suds", icon: "beer"}),
    Ember.Object.create({when: 5, foo: "Took Cab", bar: "took a cab, drinking not driving", icon: "cab"}),
    Ember.Object.create({when: 6, foo: "Had Coffee", bar: "need to chill out after that beer", icon: "coffee"}),
    Ember.Object.create({when: 1, foo: "Ate Breakfast", bar: "start of every good morning", icon: "cutlery"})
  ]);
  component.set('items.0.foo','Food');
  let later = run.later( () => {
    assert.equal(component.get('content.0.foo'),'Food', "the content array should have the updated value from items");
    assert.ok(false,"failed to observe change to 'foo' property");
    done();
  },50);
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

