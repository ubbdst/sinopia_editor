// Copyright 2019 Stanford University see LICENSE for license
/* eslint max-params: ["error", 4] */

import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import Config from 'Config'
import { getCurrentUser } from 'authSelectors'
import { retrieveResource } from 'actionCreators/resources'
import { rootResource } from 'selectors/resourceSelectors'
import Alert from '../Alert'
import SinopiaSort from './SinopiaSort'

const SinopiaSearchResults = (props) => {
  const [navigateEditor, setNavigateEditor] = useState(false)

  const groupName = (uri) => {
    const groupSlug = uri.split('/')[1]
    return Config.groupsInSinopia[groupSlug]
  }

  const handleClick = (resourceURI) => {
    props.retrieveResource(props.currentUser, resourceURI).then((success) => {
      setNavigateEditor(success)
    })
  }

  useEffect(() => {
    // Forces a wait until the root resource has been set in state
    if (navigateEditor && props.rootResource && !props.error) {
      props.history.push('/editor')
    }
  })

  // Generates an HTML row

  const generateRows = () => {
    const rows = []
    props.searchResults.forEach((row, _index) => {
      const link = `${Config.sinopiaServerBase}/${row.uri}`
      rows.push(<tr key={_index}>
        <td><button className="btn btn-link" onClick={e => handleClick(link, e) }>{ row.label }</button></td>
        <td></td>
        <td>{ groupName(row.uri) }</td>
        <td></td>
        <td><button className="btn btn-link">Edit</button>
          <button className="btn btn-link">Copy</button>
        </td>
      </tr>)
    })
    return rows
  }

  if (props.searchResults.length === 0) {
    return null
  }

  return (
    <React.Fragment>
      <Alert text={props.error} />
      <div id="search-results" className="row">
        <div className="col-sm-2"></div>
        <div className="col-sm-8">
          <h3>Your List of Bibliographic Metadata Stored in Sinopia</h3>
          <SinopiaSort />
          <table className="table table-bordered" id="search-results-list">
            <thead>
              <tr>
                <th className="search-header" style={{ width: '35%' }}>
                  Title
                </th>
                <th className="search-header" style={{ width: '35%' }}>
                  Type
                </th>
                <th className="search-header" style={{ width: '25%' }}>
                  Institution
                </th>
                <th className="search-header" style={{ width: '5%' }}>
                  Modified
                </th>
                <th className="search-header"></th>
              </tr>
            </thead>
            <tbody>
              { generateRows() }
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  )
}

SinopiaSearchResults.propTypes = {
  searchResults: PropTypes.array,
  retrieveResource: PropTypes.func,
  currentUser: PropTypes.object,
  history: PropTypes.object,
  rootResource: PropTypes.object,
  error: PropTypes.string,
}

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state),
  searchResults: state.selectorReducer.search.results,
  rootResource: rootResource(state),
  error: state.selectorReducer.editor.retrieveResourceError,
})

const mapDispatchToProps = dispatch => bindActionCreators({ retrieveResource }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SinopiaSearchResults)
