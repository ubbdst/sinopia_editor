// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import LoadByRDFForm from 'components/load/LoadByRDFForm'
import { fireEvent, wait } from '@testing-library/react'
import {
  renderWithRedux, createReduxStore, setupModal, createBlankState,
} from 'testUtils'
import { getFixtureResourceTemplate } from '../../fixtureLoaderHelper'
import * as sinopiaServer from 'sinopiaServer'
import { createMemoryHistory } from 'history'
import shortid from 'shortid'
import * as sinopiaSearch from 'sinopiaSearch'
import { modalType } from 'selectors/modalSelectors'

jest.mock('sinopiaSearch')
jest.mock('sinopiaServer')

const createInitialState = () => {
  const state = createBlankState()
  state.authenticate.authenticationState = {
    currentUser: {
      username: 'jlittman',
    },
  }
  return state
}

const n3 = `<> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@eng .
<> <http://sinopia.io/vocabulary/hasResourceTemplate> "resourceTemplate:bf2:WorkTitle" .
<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Title> .
<http://foo> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@eng .
`

const resource = {
  'resourceTemplate:bf2:WorkTitle': {
    'http://id.loc.gov/ontologies/bibframe/mainTitle': {
      items: {
        abc123: {
          content: 'foo',
          label: 'foo',
          lang: 'eng',
        },
      },
    },
    'http://id.loc.gov/ontologies/bibframe/note': {},
    'http://id.loc.gov/ontologies/bibframe/partName': {},
    'http://id.loc.gov/ontologies/bibframe/partNumber': {},
  },
}

describe('LoadByRDFForm', () => {
  setupModal()

  shortid.generate = jest.fn().mockReturnValue('abc123')
  sinopiaServer.getResourceTemplate.mockImplementation(getFixtureResourceTemplate)
  sinopiaServer.foundResourceTemplate.mockResolvedValue(true)
  sinopiaSearch.getTemplateSearchResults.mockResolvedValue({
    totalHits: 1,
    results: [{
      id: 'resourceTemplate:bf2:WorkTitle',
      resourceLabel: 'Work Title',
      resourceURI: 'http://id.loc.gov/ontologies/bibframe/Title',
    }],
    error: undefined,
  })

  it('loads resource from provided N3', async () => {
    const history = createMemoryHistory()
    const store = createReduxStore(createInitialState())
    const { getByText, container, getByLabelText } = renderWithRedux(
      <LoadByRDFForm history={history} />, store,
    )
    expect(getByText('Load RDF into Editor')).toBeInTheDocument()
    // No error message
    expect(container.querySelector('.alert-danger')).not.toBeInTheDocument()
    // Submit disabled
    expect(getByText('Submit')).toBeDisabled()

    // Populate the form
    fireEvent.change(getByLabelText('RDF'), { target: { value: n3 } })
    expect(getByText('Submit')).not.toBeDisabled()
    fireEvent.click(getByText('Submit'))

    // Wait for the page change
    await wait(() => expect(history.location.pathname).toBe('/editor'))

    expect(store.getState().selectorReducer.entities.resources.abc123).toEqual(resource)
    expect(store.getState().selectorReducer.editor.unusedRDF.abc123).toEqual(`<http://foo> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@eng .
`)
  })

  it('loads resource from provided N3 with base URI', async () => {
    const history = createMemoryHistory()
    const store = createReduxStore(createInitialState())
    const { getByText, container, getByLabelText } = renderWithRedux(
      <LoadByRDFForm history={history} />, store,
    )
    expect(getByText('Load RDF into Editor')).toBeInTheDocument()
    // No error message
    expect(container.querySelector('.alert-danger')).not.toBeInTheDocument()

    // Populate the form
    fireEvent.change(getByLabelText('RDF'), { target: { value: n3.replace(/<>/g, '<http://bar>') } })
    fireEvent.input(getByLabelText('Base URI'), { target: { value: 'http://bar' } })
    fireEvent.click(getByText('Submit'))

    // Wait for the page change
    await wait(() => expect(history.location.pathname).toBe('/editor'))

    expect(store.getState().selectorReducer.entities.resources.abc123).toEqual(resource)
    expect(store.getState().selectorReducer.editor.unusedRDF.abc123).toEqual(`<http://foo> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@eng .
`)
  })

  it('displays error when problem loading', async () => {
    const history = createMemoryHistory()
    const store = createReduxStore(createInitialState())
    const {
      getByText, container, getByLabelText, findByText,
    } = renderWithRedux(
      <LoadByRDFForm history={history} />, store,
    )
    expect(getByText('Load RDF into Editor')).toBeInTheDocument()
    // No error message
    expect(container.querySelector('.alert-danger')).not.toBeInTheDocument()

    // Populate the form
    fireEvent.change(getByLabelText('RDF'), { target: { value: 'not n3' } })
    fireEvent.click(getByText('Submit'))

    expect(await findByText(/Error parsing/)).toBeInTheDocument()
    expect(container.querySelector('.alert-danger')).toBeInTheDocument()

    // Page doesn't change
    expect(history.location.pathname).toBe('/')
  })

  it('asks user for resource template when not provided', async () => {
    const n3WithRt = `<> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@eng .
    <> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Title> .
    `

    const history = createMemoryHistory()
    const store = createReduxStore(createInitialState())
    const {
      getByText, getByLabelText, findByText, getByPlaceholderText,
    } = renderWithRedux(
      <LoadByRDFForm history={history} />, store,
    )
    expect(getByText('Load RDF into Editor')).toBeInTheDocument()

    // Populate the form
    fireEvent.change(getByLabelText('RDF'), { target: { value: n3WithRt } })
    expect(getByText('Submit')).not.toBeDisabled()
    fireEvent.click(getByText('Submit'))

    // Wait for resource template chooser modal
    expect(await findByText('Choose resource template')).toBeInTheDocument()
    fireEvent.change(getByPlaceholderText(/Enter id, label/), { target: { value: 'resourceTemplate:bf2:WorkTitle' } })

    fireEvent.click(await findByText(/Work Title/))

    fireEvent.click(getByText('Save', 'Button'))

    await wait(() => modalType(store.getState()) !== 'GroupChoiceModal')

    // Wait for the page change
    await wait(() => expect(history.location.pathname).toBe('/editor'))
  })
})
