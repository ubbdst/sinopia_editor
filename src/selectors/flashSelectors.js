// Copyright 2019 Stanford University see LICENSE for license

export const findTemplateMessages = state => state.selectorReducer.present.editor.uploadTemplateMessages

// To avoid have to export findTemplateMessages as default
export const noop = () => {}
