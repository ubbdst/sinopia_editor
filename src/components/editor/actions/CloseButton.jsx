// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { clearResource } from 'actions/index'
import { currentResourceKey, resourceHasChangesSinceLastSave } from 'selectors/resourceSelectors'
import { useHistory } from 'react-router-dom'
import CloseResourceModal from './CloseResourceModal'
import { showModal } from 'actions/modals'

const CloseButton = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const resourceKey = useSelector((state) => currentResourceKey(state))
  const resourceHasChanged = useSelector((state) => resourceHasChangesSinceLastSave(state))

  const handleClick = (event) => {
    if (resourceHasChanged) {
      dispatch(showModal('CloseResourceModal'))
    } else {
      closeResource()
    }
    event.preventDefault()
  }
  const btnClass = props.css || 'btn-primary'
  const buttonLabel = props.label || 'Close'
  const buttonClasses = `btn ${btnClass}`
  const closeResourceKey = props.resourceKey || resourceKey

  const closeResource = () => {
    dispatch(clearResource(closeResourceKey))
    // In case this is /editor/<rtId>, clear
    history.push('/editor')
  }

  return (
    <React.Fragment>
      <CloseResourceModal closeResource={closeResource} />
      <button type="button"
              className={buttonClasses}
              aria-label="Close"
              title="Close"
              onClick={handleClick}>
        {buttonLabel}
      </button>
    </React.Fragment>
  )
}

CloseButton.propTypes = {
  css: PropTypes.string,
  label: PropTypes.string,
  resourceKey: PropTypes.string,
}

export default CloseButton
