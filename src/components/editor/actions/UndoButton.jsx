// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import { ActionCreators } from 'redux-undo'
import store from '../../../store'

const UndoButton = () => {
  const handleClick = (event) => {
    store.dispatch(ActionCreators.undo())
    event.preventDefault()
  }

  return (
    <React.Fragment>
      <button type="button"
              className="btn btn-primary"
              aria-label="Undo"
              title="Undo"
              onClick={handleClick}>
        Undo
      </button>
    </React.Fragment>
  )
}

export default UndoButton
