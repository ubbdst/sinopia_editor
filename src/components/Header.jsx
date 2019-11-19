// Copyright 2019 Stanford University see LICENSE for license

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import Config from 'Config'
import { connect } from 'react-redux'
import { hasResource as hasResourceSelector } from 'selectors/resourceSelectors'

class Header extends Component {
  hidePopovers() {
    if (window.$('.popover').popover) {
      window.$('.popover').popover('hide')
    }
  }

  render() {
    return (
      <div className="editor-navbar">
        <div className="row">
          <div className="col-9">
            <h2 className="editor-subtitle"><a className="editor-subtitle" href="/">SINOPIA</a></h2> <h2 className="editor-version">v{this.props.version}</h2>
            <h1 className="editor-logo">LINKED DATA EDITOR{`${Config.sinopiaEnv}`}</h1>
          </div>
          <div className="col-3">
            <ul className="nav pull-right">
              <li className="nav-item">
                <a className="nav-link editor-header-text" href={`https://profile-editor.${Config.sinopiaDomainName}/`}>Profile Editor</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link editor-help-resources" onClick={this.props.triggerEditorMenu}>Help and Resources</a>
              </li>
            </ul>
          </div>
        </div>
        <ul className="nav nav-tabs editor-navtabs">
          { /* Navlinks enable highlighting the appropriate tab based on route, active style is defined in css */}
          <li className="nav-item"><NavLink onClick={this.hidePopovers} className="nav-link" to="/search">Search</NavLink></li>
          <li className="nav-item"><NavLink onClick={this.hidePopovers} className="nav-link" to="/templates">Resource Templates</NavLink></li>
          <li className="nav-item"><NavLink onClick={this.hidePopovers} className="nav-link" to="/load">Load RDF</NavLink></li>
          <li className="nav-item"><NavLink onClick={this.hidePopovers} className="nav-link" to="/exports">Exports</NavLink></li>
          { this.props.hasResource
           && <li className="nav-item"><NavLink onClick={this.hidePopovers} className="nav-link" to="/editor">Editor</NavLink></li>
          }
        </ul>
      </div>
    )
  }
}

Header.propTypes = {
  triggerEditorMenu: PropTypes.func,
  version: PropTypes.string,
  hasResource: PropTypes.bool,
}

const mapStateToProps = (state) => {
  const hasResource = hasResourceSelector(state)
  return {
    version: state.selectorReducer.present.appVersion.version,
    hasResource,
  }
}

export default connect(mapStateToProps)(Header)
