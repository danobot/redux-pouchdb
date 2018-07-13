import 'should'
import { createStore, compose } from 'redux'
import {
  persistStore,
  persistentReducer,
  waitInitialization,
  waitPersistence
} from '../src/index'
import load from '../src/utils/load'
import PouchDB from 'pouchdb'
import timeout from 'timeout-then'

const waitAction = store => type =>
  new Promise(resolve => {
    store.subscribe((...p) => {
      const state = store.getState()
      resolve(state)
    })
  })

describe('redux-pouchdb tests', () => {
  const db = new PouchDB('app', { db: require('memdown') })
  const INCREMENT = 'INCREMENT'
  const DECREMENT = 'DECREMENT'

  const reducer = (state = { x: 0 }, action) => {
    switch (action.type) {
      case INCREMENT:
        return { x: state.x + 1 }
      case DECREMENT:
        return { x: state.x - 1 }
      default:
        return state
    }
  }
  const reducerName = 'counter'
  const finalReducer = persistentReducer(db, reducerName)(reducer)

  it(
    'should persist store state',
    async done => {
      let store = createStore(finalReducer)
      persistStore(store)
      // console.log('-----go?----')
      const success = await waitInitialization(reducerName)
      success.should.be.equal(true)
      // console.log('-----asserted----')

      const doc = await load(db)(reducerName)
      // console.log('load', reducerName, doc)

      const x1a = store.getState().x
      const x1b = doc.state.x
      // console.log('-----got----')

      x1a.should.be.equal(x1b)

      store.dispatch({
        type: INCREMENT
      })
      // console.log('------incremented---')

      await waitPersistence(reducerName)
      // console.log('----waited-----')

      const doc2 = await load(db)(reducerName)
      // console.log('-----loaded----')

      const x2a = store.getState().x
      const x2b = doc2.state.x

      x2a.should.be.equal(x2b)
      // console.log('-----done----')

      done()
    },
    10000
  )
})
