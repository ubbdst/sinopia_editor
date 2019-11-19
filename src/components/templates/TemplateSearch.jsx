import React, { useEffect, useRef } from 'react'
import { getTemplateSearchResults } from 'sinopiaSearch'
import { useDispatch, useSelector } from 'react-redux'
import { setTemplateSearchResults } from 'actions/index'
import Alert from '../Alert'

const TemplateSearch = () => {
  const dispatch = useDispatch()
  // Tokens allow us to cancel an existing search. Does not actually stop the
  // search, but causes result to be ignored.
  const tokens = useRef([])

  // This starts off with the top of the list.
  useEffect(() => {
    getTemplateSearchResults('').then((response) => {
      dispatch(setTemplateSearchResults(response.results, response.totalHits, response.error))
    })
  }, [dispatch])

  const error = useSelector(state => state.selectorReducer.present.templateSearch.error)

  const search = (query) => {
    // Cancel all current searches
    while (tokens.current.length > 0) {
      tokens.current.pop().cancel = true
    }

    // Create a token for this set of searches
    const token = { cancel: false }
    tokens.current.push(token)

    getTemplateSearchResults(query).then((response) => {
      if (!token.cancel) dispatch(setTemplateSearchResults(response.results, response.totalHits, response.error))
    })
  }

  return (
    <div id="search">
      <Alert text={error} />
      <div className="container">
        <div className="row">
          <form className="form-inline" onSubmit={event => event.preventDefault()}>
            <div className="form-group" style={{ paddingBottom: '10px', paddingTop: '10px' }}>
              <label htmlFor="searchInput">Find a resource template</label>&nbsp;
              <div className="input-group" style={{ width: '750px', paddingLeft: '5px' }}>
                <input id="searchInput" type="text" className="form-control"
                       onChange={ event => search(event.target.value) }
                       placeholder="Enter id, label, URI, remark, or author" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TemplateSearch
