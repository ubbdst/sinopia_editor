// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import LoadByRDFForm from 'components/load/LoadByRDFForm'
import { fireEvent, wait } from '@testing-library/react'
/* eslint import/no-unresolved: 'off' */
import { renderWithRedux, createReduxStore } from 'testUtils'
import { getFixtureResourceTemplate } from '../../fixtureLoaderHelper'
import * as sinopiaServer from 'sinopiaServer'
import { createMemoryHistory } from 'history'
import shortid from 'shortid'

jest.mock('sinopiaServer')

const createInitialState = () => {
  return {
    selectorReducer: {
      resource: {},
      entities: {
        resourceTemplates: {},
      },
      editor: {
        expanded: {},
      },
    },
    authenticate: {
      authenticationState: {
        currentUser: {
          username: 'jlittman',
        },
      },
    },
  }
}

const n3 = `<> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@en .
<> <http://sinopia.io/vocabulary/hasResourceTemplate> "resourceTemplate:bf2:WorkTitle" .
<> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Title> .
<http://foo> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@en .
`

const resource = {
  'resourceTemplate:bf2:WorkTitle': {
    'http://id.loc.gov/ontologies/bibframe/mainTitle': {
      items: {
        abc123: {
          content: 'foo',
          label: 'foo',
          lang: 'en',
        },
      },
    },
    'http://id.loc.gov/ontologies/bibframe/note': {},
    'http://id.loc.gov/ontologies/bibframe/partName': {},
    'http://id.loc.gov/ontologies/bibframe/partNumber': {},
  },
}

describe('LoadByRDFForm', () => {
  shortid.generate = jest.fn().mockReturnValue('abc123')
  sinopiaServer.getResourceTemplate.mockImplementation(getFixtureResourceTemplate)

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
    fireEvent.change(getByLabelText('N3 RDF'), { target: { value: n3 } })
    expect(getByText('Submit')).not.toBeDisabled()
    fireEvent.click(getByText('Submit'))

    // Wait for the page change
    await wait(() => expect(history.location.pathname).toBe('/editor'))

    expect(store.getState().selectorReducer.resource).toEqual(resource)
    expect(store.getState().selectorReducer.editor.unusedRDF).toEqual(`<http://foo> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@en .
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
    fireEvent.change(getByLabelText('N3 RDF'), { target: { value: n3.replace(/<>/g, '<http://bar>') } })
    fireEvent.input(getByLabelText('Base URI'), { target: { value: 'http://bar' } })
    fireEvent.click(getByText('Submit'))

    // Wait for the page change
    await wait(() => expect(history.location.pathname).toBe('/editor'))

    expect(store.getState().selectorReducer.resource).toEqual(resource)
    expect(store.getState().selectorReducer.editor.unusedRDF).toEqual(`<http://foo> <http://id.loc.gov/ontologies/bibframe/mainTitle> "foo"@en .
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
    fireEvent.change(getByLabelText('N3 RDF'), { target: { value: 'not n3' } })
    fireEvent.click(getByText('Submit'))

    expect(await findByText(/Error parsing/)).toBeInTheDocument()
    expect(container.querySelector('.alert-danger')).toBeInTheDocument()

    // Page doesn't change
    expect(history.location.pathname).toBe('/')

    // State doesn't change
    expect(store.getState()).toEqual(createInitialState())
  })
})
