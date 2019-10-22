import React from 'react'
import SinopiaSort from 'components/search/SinopiaSort'
import { renderWithRedux, createReduxStore } from 'testUtils'
import { fireEvent } from '@testing-library/react'
/* eslint import/namespace: 'off' */
import * as server from 'sinopiaSearch'

describe('<SinopiaSort />', () => {
  it('renders with default', () => {
    const store = createReduxStore({ selectorReducer: { search: { sortField: undefined, sortOrder: undefined } } })
    const { getByText, queryByText } = renderWithRedux(
      <SinopiaSort />, store,
    )
    expect(getByText('Sort by')).toBeInTheDocument()
    expect(getByText('Label, ascending')).toBeInTheDocument()
    expect(queryByText('Label, ascending', { selector: '.active' })).not.toBeInTheDocument()

    expect(getByText('Relevance', { selector: '.active' })).toBeInTheDocument()
  })

  it('renders with selected sort order', () => {
    const store = createReduxStore({ selectorReducer: { search: { sortField: 'label', sortOrder: 'asc' } } })
    const { getByText } = renderWithRedux(
      <SinopiaSort />, store,
    )
    expect(getByText('Label, ascending', { selector: '.active' })).toBeInTheDocument()
  })

  it('clicking changes the sort order', async () => {
    const mockGetSearchResults = jest.fn()
    server.getSearchResults = mockGetSearchResults.mockResolvedValue({
      totalHits: 1,
      results: [
        {
          uri: 'repository/cornell/ca0d53d0-2b99-4f75-afb0-739a6f0af4f4',
          label: 'The Real Mark Twain',
          title: ['The Real Mark Twain'],
        },
      ],
    })

    const state = {
      selectorReducer: {
        search: {
          results: [],
          totalResults: 0,
          query: 'twain',
          authority: undefined,
          error: undefined,
          resultsPerPage: 15,
          startOfRange: 10, // 0 based
          sortField: undefined,
          sortOrder: undefined,
        },
      },
    }
    const store = createReduxStore(state)
    const { getByText, findByText } = renderWithRedux(
      <SinopiaSort />, store,
    )
    fireEvent.click(getByText('Sort by'))
    fireEvent.click(getByText('Label, ascending'))

    expect(await findByText('Label, ascending', { selector: '.active' })).toBeInTheDocument()
    expect(server.getSearchResults).toHaveBeenCalledWith('twain', 0, 15, 'label', 'asc')
  })
})