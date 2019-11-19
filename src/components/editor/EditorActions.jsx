// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import CopyToNewButton from './actions/CopyToNewButton'
import PreviewButton from './actions/PreviewButton'
import CloseButton from './actions/CloseButton'
import SaveAndPublishButton from './actions/SaveAndPublishButton'
import UndoButton from './actions/UndoButton'
import RedoButton from './actions/RedoButton'

const EditorActions = () => (
  <div className="row">
    <section className="col-md-3 offset-md-9 text-right">
      <CopyToNewButton />
      <PreviewButton />
      <CloseButton />
      <UndoButton />
      <RedoButton />
      <SaveAndPublishButton class="editor-save" />
    </section>
  </div>
)

export default EditorActions
