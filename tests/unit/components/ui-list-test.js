import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys } = Ember;    // jshint ignore:line
import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ui-list', 'Unit | Component | ui-list', {
  // Specify the other units that are required for this test
  needs: ['component:ui-item','component:ui-icon', 'component:ui-pane', 'component:ui-icon-aspect', 'component:ui-title-aspect', 'component:ui-sub-heading-aspect', 'helper:if-then-else'],
  unit: true
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

test('items are enumerable', function(assert) {
  run(()=>{
    let component = this.subject();
    assert.ok(component.get('content').firstObject, 'even at initialization state, items/content should be enumerable');
    component.set('items', [ {when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1} ]);
    assert.ok(component.get('content').firstObject, 'a bare JS array should be fine');
    component.set('items', new A([ {when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1} ]));
    assert.ok(component.get('content').firstObject, 'an ember array passed in is ok');
  });
});


test('only valid filters are settable', function(assert) {
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
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer'}),
    Ember.Object.create({when: 5, foo: 'Took Cab', bar: 'took a cab, drinking not driving', icon: 'cab'}),
    Ember.Object.create({when: 6, foo: 'Had Coffee', bar: 'need to chill out after that beer', icon: 'coffee'}),
    Ember.Object.create({when: 1, foo: 'Ate Breakfast', bar: 'start of every good morning', icon: 'cutlery'})
  ]);
  component.set('map', {
    title: 'foo',
    subHeading: 'bar'
  });
  assert.equal(component.get('items').length, component.get('content').length, 'content and items should always be equal length');
  // validate simple property transfer
  assert.equal(
    component.get('items.0.foo'),
    component.get('content.0.foo'),
    'foo should have been copied over to \'content\' array'
  );
  assert.equal(
    component.get('items.0.badge'),
    component.get('content.0.badge'),
    'badge should have been copied over to \'content\' array'
  );
  assert.equal(
    component.get('items.1.icon'),
    component.get('content.1.icon'),
    'icon should have been copied over to \'content\' array'
  );
});

test('mappedProperties set from map hash', function(assert) {
  let component = this.subject();
  let initialMap = {
    title: 'foo',
    subHeading: 'bar'
  };
  component.set('items', [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer', walk: true})
  ]);
  component.set('map', initialMap);
  assert.equal(component.get('mappedProperties'), initialMap, 'mapped properties are setup on initialization of map property');
  let mappedFrom = component.get('_mappedFrom');
  assert.equal(mappedFrom.length, 2, '_mappedFrom is correct length');
  assert.ok(mappedFrom.contains('foo'), '_mappedFrom contains foo');
  assert.ok(mappedFrom.contains('bar'), '_mappedFrom contains bar');
});

test('mappedProperties set only with map properties', function(assert) {
  let component = this.subject({
    mapTitle: 'foo',
    mapSubHeading: 'bar'
  });
  component.set('items', [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer', walk: true})
  ]);
  assert.equal(component.get('mappedProperties.title'), 'foo', 'foo map setup map property');
  assert.equal(component.get('mappedProperties.subHeading'), 'bar', 'bar map setup map property');
  // NOTE: this stupid form of testing is based on QUnit doing some pretty odd things right now with testing the array in more direct fashion. Annoying!
  let mappedFrom = component.get('_mappedFrom');
  assert.equal(mappedFrom.length, 2, '_mappedFrom is correct length');
  assert.ok(mappedFrom.contains('foo'), '_mappedFrom contains foo');
  assert.ok(mappedFrom.contains('bar'), '_mappedFrom contains bar');
});

test('mappedProperties with combined map property and map hash', function(assert) {
  let component = this.subject({
    mapSilly: 'walk'
  });
  let initialMap = {
    title: 'foo',
    subHeading: 'bar'
  };
  component.set('items', [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer', walk: true})
  ]);
    component.set('map', initialMap);
  assert.equal(component.get('mappedProperties.title'), 'foo', 'foo map setup map property');
  assert.equal(component.get('mappedProperties.subHeading'), 'bar', 'bar map setup map property');
  assert.equal(component.get('mappedProperties.silly'), 'walk', 'silly map setup map property');
  // NOTE: this stupid form of testing is based on QUnit doing some pretty odd things right now with testing the array in more direct fashion. Annoying!
  let mappedFrom = component.get('_mappedFrom');
  assert.equal(mappedFrom.length, 3, '_mappedFrom is correct length');
  assert.ok(mappedFrom.contains('foo'), '_mappedFrom contains foo');
  assert.ok(mappedFrom.contains('bar'), '_mappedFrom contains bar');
  assert.ok(mappedFrom.contains('walk'), '_mappedFrom contains walk');
});


test('availableAspectPanes is set', function(assert) {
  let component = this.subject();
  component.set('items', [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer', walk: true})
  ]);
    component.set('map', {
    title: 'foo',
    subHeading: 'bar'
  });
  const aspectPanes = new A(component.get('availableAspectPanes'));
  assert.ok(aspectPanes.contains('iconRight'), 'iconRight should be set by default');
  assert.ok(aspectPanes.contains('title'), 'title should be set by default');
  assert.ok(aspectPanes.contains('subHeading'), 'subHeading should be set by default');
});

test('list managed properties propagated down to items (size, skin, mood, squeezed)', function(assert) {
  let component = this.subject();
  let done = assert.async();
  let done2 = assert.async();
  let items = [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
  ];
  component.set('items', items);
  this.render();
  run.later(() => {
    component.set('size','large');
    assert.equal(component.get('size'), 'large', 'INIT: size listProperty set to large');
    component.set('skin','flat');
    assert.equal(component.get('skin'), 'flat', 'INIT: skin listProperty set to flat');
    component.set('mood','success');
    assert.equal(component.get('mood'), 'success', 'INIT: mood listProperty set to success');
    component.set('squeezed',true);
    assert.equal(component.get('squeezed'), true, 'INIT: squeezed set to true');
    done();
    run.later(() => {
      assert.equal(component.get('_registry.0.child._size'), 'large', 'items should have size set to large');
      assert.equal(component.get('_registry.0.child._skin'), 'skin-flat', 'items should have skin set to flat');
      assert.equal(component.get('_registry.0.child._mood'), 'mood-success', 'items should have mood set to success');
      assert.equal(component.get('_registry.0.child._squeezed'), true, 'items should have squeezed set to true');
      done2();
    },5);
  },5);
});

test('Items are registered, mapped and appear in DOM', function(assert) {
  assert.expect(8);
  let component = this.subject({
    map: {
     title: 'foo'
    },
    items: [
      Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
      Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
      Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer', walk: true})
    ],
    mapSubHeading: 'bar'
  });
  let done = assert.async();
  this.render();
  run.later( () => {
    // sanity tests on registered items
    assert.equal(component.get('_registry.length'), 3, 'there should be three item components which have registered themselves.');
    let foey = component.get('_registry').map(i => i.child.get('foo'));
    let arrangedFoey = new A(component.get('arrangedContent').map(i=> i.get('foo')));
    assert.ok(
      foey.every(item => { return arrangedFoey.contains(item);} ),
      'Foo properties were equivalent between list\'s arrangedContent and the registered item components: ' + JSON.stringify(foey)
    );
    let icon = component.get('_registry').map(i=>i.child.get('icon'));
    assert.ok(
      foey.every(item => { return arrangedFoey.contains(item);} ),
      'Icon properties were equivalent between list\'s arrangedContent and the registered item components: ' + JSON.stringify(icon)
    );
    assert.deepEqual(
      new A(component.get('_registry').map( i => i.child.get('type'))).uniq(),
      ['ui-item'],
      'all registered items should be of type ui-item.'
    );
    // Test mappings at the Item level
    assert.equal(
      component.get('_registry').map(i=>i.child).filter(i=>i.get('foo')==='Groceries')[0].get('title'),
      'Groceries',
      'The foo property should have an alias to title in the item component (via a map hash prop on list)'
    );
    assert.equal(
      component.get('_registry').map(i=>i.child).filter(i=>i.get('bar') === 'visit sick uncle Joe')[0].get('subHeading'),
      'visit sick uncle Joe',
      'The bar property should have an alias to subHeading in the item component (via a direct property mapping proxied from list)'
    );
    // DOM checking
    assert.equal(
      component.$('.center-pane .title').length,
      3,
      'The DOM should have 3 items with "titles" in it'
    );
    assert.equal(
      component.$('.right-pane .badge').length,
      2,
      'The DOM should have 2 items with "badges" in it'
    );
    done();
  },100);
});


test('Test that decorator properties make it through to items', function(assert) {
  const component = this.subject();
  const Decorator = Ember.ObjectProxy.extend({
    opinion: computed('foo', function() {
      return this.get('foo') === 'Groceries' ? 'yup' : 'nope';
    })
  });
  // Set
  component.set('items', [
    Ember.Object.create({when: 2, foo: 'Groceries', bar: 'hungry, hungry, hippo', icon: 'shopping-cart', badge: 1}),
    Ember.Object.create({when: 3, foo: 'Hospital', bar: 'visit sick uncle Joe', icon: 'ambulance', badge: 6}),
    Ember.Object.create({when: 4, foo: 'Pub', bar: 'it\'s time for some suds', icon: 'beer', walk: true})
  ]);
  // Decorate
  component.set('items', component.get('items').map(item => {
    return Decorator.create({content:item});
  }));
  // Look for decorations
  assert.equal(component.get('items.0.opinion'), 'yup', 'the opinion CP should exist and produce a proper response' );
  assert.equal(component.get('items.1.opinion'), 'nope', 'the opinion CP should exist and produce a proper response' );
  // Now look in the Item component
  let done = assert.async();
  run.later( () => {
    assert.ok(component.get('_registry'), 'List\'s registered items array has been populated');
    // assert.equal(component.get('_registeredItems.length'), 3, 'there should be three registered items.');
    // assert.equal(
    //   component.get('_registeredItems').findBy('foo','Groceries').get('title'),
    //   'Groceries',
    //   'The item component also HAS the the ornamented "opinion" property and it set to the correct value'
    // );
    done();
  },150);
});
