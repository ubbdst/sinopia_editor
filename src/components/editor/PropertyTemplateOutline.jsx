// Copyright 2019 Stanford University see Apache2.txt for license

import React, {Component} from 'react'
import OutlineHeader from './OutlineHeader'
import PropertyTypeRow from './PropertyTypeRow'
import RequiredSuperscript from './RequiredSuperscript'
import { getResourceTemplate } from '../../sinopiaServer'
import { isResourceWithValueTemplateRef, resourceToName } from '../../Utilities'
import PropertyComponent from './PropertyComponent'
import PropTypes from 'prop-types'
import shortid from 'shortid'
import ResourceProperty from "./ResourceProperty";

export class PropertyTemplateOutline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      propertyTypeRow: [],
      nestedResourceTemplates: []
    }
  }

  outlineRowClass = () => {
    let classNames = "rOutline-property"
    if (this.state.collapsed) { classNames += " collapse"}
    return classNames
  }

  handleAddClick = (event) => {
    event.preventDefault()
    if (this.props.handleAddClick !== undefined) {
      this.props.handleAddClick(event)
    }
  }

  handleMintUri = (event) => {
    event.preventDefault()
    if (this.props.handleMintUri !== undefined) {
      this.props.handleMintUri(event)
    }
  }

  isRequired = (property) => {
    if (property.mandatory === "true") {
      return <RequiredSuperscript />
    }
  }

  fulfillRTPromises = async (promiseAll) => {
    return await promiseAll.then(rts => {
      rts.map(rt => {
        const joinedRts = [...this.state.nestedResourceTemplates]
        joinedRts.push(rt.response.body)
        this.setState({nestedResourceTemplates: joinedRts})
      })
    }).catch(() => {})
  }

  resourceTemplatePromises = (templateRefs) => {
    return Promise.all(templateRefs.map(rtId =>
      getResourceTemplate(rtId)
    ))
  }

  handleClick = (property) => (event) => {
    event.preventDefault()

    this.setState({collapsed: !this.state.collapsed})

    const templateRefList = isResourceWithValueTemplateRef(property) ? property.valueConstraint.valueTemplateRefs : []

    this.fulfillRTPromises(this.resourceTemplatePromises(templateRefList)).then(() => {
      this.addPropertyTypeRows(this.props.propertyTemplate)
    })
  }

  addPropertyTypeRows = (property) => {
    let propertyJsx, existingJsx, newOutput = this.state.propertyTypeRow

    if (isResourceWithValueTemplateRef(property)) {
      propertyJsx = <ResourceProperty propertyTemplate={property}
                                      reduxPath={this.props.reduxPath}
                                      nestedResourceTemplates={this.state.nestedResourceTemplates}
                                      handleAddClick={this.props.handleAddClick}
                                      handleMintUri={this.props.handleMintUri} />
    } else {
      propertyJsx = <PropertyComponent index={0} rtId={property.rtId} propertyTemplate={property} />
    }

    newOutput.forEach((propertyJsx) => {
      if (this.props.propertyTemplate.propertyURI === propertyJsx.props.propertyTemplate.propertyURI) {
        existingJsx = propertyJsx
      }
    })
    if (existingJsx === undefined) {
      newOutput.push(
        <PropertyTypeRow
          key={shortid.generate()}
          handleAddClick={this.props.handleAddClick}
          handleMintUri={this.props.handleMintUri}
          propertyTemplate={property}>
          {propertyJsx}
        </PropertyTypeRow>
      )
    }

    this.setState({propertyTypeRow: newOutput, rowAdded: true})
  }

  render() {
    return(
      <div className="rtOutline" key={shortid.generate()}>
        <OutlineHeader label={this.props.propertyTemplate.propertyLabel}
                       id={resourceToName(this.props.propertyTemplate.propertyURI)}
                       collapsed={this.state.collapsed}
                       key={shortid.generate()}
                       isRequired={this.isRequired(this.props.propertyTemplate)}
                       handleCollapsed={this.handleClick(this.props.propertyTemplate)} />
        <div className={this.outlineRowClass()}>
          {this.state.propertyTypeRow}
        </div>
      </div>
    )
  }
}

PropertyTemplateOutline.propTypes = {
  handleAddClick: PropTypes.func,
  handleMintUri: PropTypes.func,
  handleCollapsed: PropTypes.func,
  isRequired: PropTypes.func,
  propertyTemplate: PropTypes.object,
  reduxPath: PropTypes.array,
  rtId: PropTypes.string
}

export default PropertyTemplateOutline
