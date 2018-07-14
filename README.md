# redux-pouchdb

## How it is done

- The [PouchDB](http://pouchdb.com/) database persists the state of the [Redux](rackt.github.io/redux) store every time it changes.
- An action with type DB_CHANGES is dispatched to the store every time the database syncs.

## Install

`yarn add redux-pouchdb@1.0.0-rc.1`

## Usage

The reducers to be persisted should be augmented by a higher order reducer accordingly to the type of the state. 

Reducers in which the state is an object get persisted as a single document by using `persistentDocumentReducer`

Reducers in which the state is an array get persisted as a collection where each item is a document by using `persistentDocumentReducer`

Besides that the store should passed to the plain function `persistStore`

By following this steps your pouchdb database should keep it self in sync with your redux store.

### `persistentDocumentReducer`

The reducers shaped like as object that you wish to persist should be enhanced with this higher order reducer.

``` js
import { persistentDocumentReducer } from 'redux-pouchdb';

const counter = (state = {count: 0}, action) => {
  switch(action.type) {
  case INCREMENT:
    return { count: state.count + 1 };
  case DECREMENT:
    return { count: state.count - 1 };
  default:
    return state;
  }
};

const reducerName = 'counter'
const finalReducer = persistentDocumentReducer(db, reducerName)(reducer)
```

### `persistentCollectionReducer`

The reducers shaped like as array that you wish to persist should be enhanced with this higher order reducer.

``` js
import { persistentCollectionReducer } from 'redux-pouchdb';

const stackCounter = (state = [{ x: 0 }, { x: 1 }, { x: 2 }], action) => {
  switch (action.type) {
    case INCREMENT:
      return state.concat({ x: state.length })
    case DECREMENT:
      return !state.length ? state : state.slice(0, state.length - 1)
    default:
      return state
  }
}

const reducerName = 'stackCounter'
export default persistentCollectionReducer(db, reducerName)(stackCounter)
```

### `persistStore`

This plain function holds the store for later usage

``` js
import { persistStore } from 'redux-pouchdb';

const db = new PouchDB('dbname');

const store = createStore(reducer, initialState);
persistStore(store)
```

### `waitSync`

This function receives a reducerName and returns a promise that resolve true if that reducer is synced

``` js
let store = createStore(persistedReducer)
persistStore(store)

store.dispatch({
  type: INCREMENT
})

const isSynced = await waitSync(reducerName)
```
