// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import { ActionCreators } from 'redux-undo'
import store from '../../../store'

const RedoButton = () => {
  const handleClick = (event) => {
    store.dispatch(ActionCreators.redo())
    event.preventDefault()
  }

  return (
    <React.Fragment>
      <button type="button"
              className="btn btn-primary"
              aria-label="Redo"
              title="Redo"
              onClick={handleClick}>
        Redo
      </button>
    </React.Fragment>
  )
}

export default RedoButton
