// Copyright 2019 Stanford University see LICENSE for license

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Header from '../Header'
import { useSelector } from 'react-redux'
import Alerts from '../Alerts'
import Config from 'Config'

export const exportsErrorKey = 'exports'

const Exports = (props) => {
  const exportFiles = useSelector(state => state.selectorReducer.present.entities.exports)

  const sortedExportFiles = useMemo(() => exportFiles.sort((a, b) => a.localeCompare(b)), [exportFiles])

  const exportFileList = sortedExportFiles.map(exportFile => (
    <li key={exportFile}><a target="_blank" rel="noopener noreferrer" href={`${Config.exportBucketUrl}/${exportFile}`}>{exportFile}</a></li>
  ))

  return (
    <div id="exports">
      <Header triggerEditorMenu={props.triggerHandleOffsetMenu}/>
      <h4>Exports</h4>
      <Alerts errorKey={exportsErrorKey} />
      <p className="text-muted">Exports are regenerated weekly. Each zip file contains separate files per record (as JSON-LD).</p>
      <ul className="list-unstyled">
        {exportFileList}
      </ul>
    </div>
  )
}

Exports.propTypes = {
  triggerHandleOffsetMenu: PropTypes.func,
}

export default Exports
