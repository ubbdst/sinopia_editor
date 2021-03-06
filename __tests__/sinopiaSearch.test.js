// Copyright 2019 Stanford University see LICENSE for license

import {
  getSearchResults, getTemplateSearchResults, getLookupResults, getSearchResultsWithFacets,
} from 'sinopiaSearch'
import { findAuthorityConfigs } from 'utilities/authorityConfig'

describe('getSearchResults', () => {
  const successResult = {
    took: 8,
    timed_out: false,
    _shards: {
      total: 5,
      successful: 5,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: 2,
      max_score: 0.2876821,
      hits: [{
        _index: 'sinopia_resources',
        _type: 'sinopia',
        _id: 'repository/cornell/34ef053e-f558-4299-a8a7-c8b79a598d99',
        _score: 0.2876821,
        _source: {
          title: ['foo bar'],
          uri: 'http://platform:8080/repository/cornell/34ef053e-f558-4299-a8a7-c8b79a598d99',
          label: 'foo bar',
          type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
          group: 'cornell',
          created: '2019-11-27T19:05:48.496Z',
          modified: '2019-11-27T19:05:48.496Z',
        },
      }, {
        _index: 'sinopia_resources',
        _type: 'sinopia',
        _id: 'repository/cornell/a96f16c1-a15c-4f4f-8a25-7ed49ba1eebe',
        _score: 0.2876821,
        _source: {
          title: ['foo'],
          subtitle: [],
          uri: 'http://platform:8080/repository/cornell/a96f16c1-a15c-4f4f-8a25-7ed49ba1eebe',
          label: 'foo',
          type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
          group: 'cornell',
          created: '2019-11-27T19:05:48.496Z',
          modified: '2019-11-27T19:05:48.496Z',
        },
      }],
    },
  }

  const errorResult = {
    error: {
      root_cause: [{
        type: 'parsing_exception',
        reason: '[simple_query_string] unsupported field [xdefault_operator]',
        line: 1,
        col: 90,
      }],
      type: 'parsing_exception',
      reason: '[simple_query_string] unsupported field [xdefault_operator]',
      line: 1,
      col: 90,
    },
  }

  it('performs a search with default sort order and returns results', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => successResult }))

    const results = await getSearchResults('foo')
    expect(results).toEqual({
      totalHits: 2,
      results: [
        {
          uri: 'http://platform:8080/repository/cornell/34ef053e-f558-4299-a8a7-c8b79a598d99',
          label: 'foo bar',
          created: '2019-11-27T19:05:48.496Z',
          modified: '2019-11-27T19:05:48.496Z',
          type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
          group: 'cornell',
        },
        {
          uri: 'http://platform:8080/repository/cornell/a96f16c1-a15c-4f4f-8a25-7ed49ba1eebe',
          label: 'foo',
          created: '2019-11-27T19:05:48.496Z',
          modified: '2019-11-27T19:05:48.496Z',
          type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
          group: 'cornell',
        },
      ],
    })
    const body = {
      query: {
        bool: {
          must: {
            simple_query_string: {
              fields: ['title^3', 'subtitle^2', 'uri^3', 'text'],
              default_operator: 'AND',
              query: 'foo',
            },
          },
        },
      },
      from: 0,
      size: 10,
      sort: ['_score'],
    }
    expect(global.fetch).toHaveBeenCalledWith('/api/search/sinopia_resources/sinopia/_search', { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method: 'POST' })
  })

  it('performs a search with specified page and sort order and returns results', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => successResult }))
    await getSearchResults('foo', {
      startOfRange: 10, resultsPerPage: 15, sortField: 'label', sortOrder: 'desc',
    })
    const body = {
      query: {
        bool: {
          must: {
            simple_query_string: {
              fields: ['title^3', 'subtitle^2', 'uri^3', 'text'],
              default_operator: 'AND',
              query: 'foo',
            },
          },
        },
      },
      from: 10,
      size: 15,
      sort: [{
        label: 'desc',
      }],
    }
    expect(global.fetch).toHaveBeenCalledWith('/api/search/sinopia_resources/sinopia/_search', { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method: 'POST' })
  })

  it('performs a search and handles ES error', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => errorResult }))

    const results = await getSearchResults('foo')
    expect(results).toEqual({
      totalHits: 0,
      results: [],
      error: '[simple_query_string] unsupported field [xdefault_operator]',
    })
  })

  it('performs a search and handles raised error', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject(new Error('Frickin network')))

    const results = await getSearchResults('foo')
    expect(results).toEqual({
      totalHits: 0,
      results: [],
      error: 'Error: Frickin network',
    })
  })
})

describe('getTemplateSearchResults', () => {
  const trellisDownResult = {
    totalHits: 0,
    results: [],
    error: '504: Gateway Timout',
  }
  it('returns 504 timeout error if Sinopia server is unavailable', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => trellisDownResult }))
    const results = await getTemplateSearchResults('Palo Alto')
    expect(results).toEqual({
      totalHits: 0,
      results: [],
      error: '504: Gateway Timout',
    })
  })
})

describe('getSearchResultsWithFacets', () => {
  const successResult = {
    took: 5,
    timed_out: false,
    _shards: {
      total: 5,
      successful: 5,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: 2,
      max_score: 1,
      hits: [
        {
          _index: 'sinopia_resources',
          _type: 'sinopia',
          _id: 'repository/cornell/f2b0291d-b679-4560-bd03-d3eb3b6fa187',
          _score: 1,
          _source: {
            uri: 'http://platform:8080/repository/cornell/f2b0291d-b679-4560-bd03-d3eb3b6fa187',
            title: [
              'foo',
            ],
            label: 'foo',
            text: [
              'foo',
            ],
            created: '2019-11-27T19:05:48.496Z',
            modified: '2019-11-27T19:05:48.496Z',
            type: [
              'http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle',
            ],
            group: 'cornell',
          },
        },
        {
          _index: 'sinopia_resources',
          _type: 'sinopia',
          _id: 'repository/duke/718e77f1-a07d-4579-ad56-0c93bd3067ea',
          _score: 1,
          _source: {
            uri: 'http://platform:8080/repository/duke/718e77f1-a07d-4579-ad56-0c93bd3067ea',
            title: [
              'bar',
            ],
            label: 'bar',
            text: [
              'bar',
            ],
            created: '2019-11-27T19:07:03.643Z',
            modified: '2019-11-27T19:07:03.643Z',
            type: [
              'http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle',
            ],
            group: 'duke',
          },
        },
      ],
    },
    aggregations: {
      types: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: 'http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle',
            doc_count: 2,
          },
        ],
      },
      groups: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: 'cornell',
            doc_count: 1,
          },
          {
            key: 'duke',
            doc_count: 1,
          },
        ],
      },
    },
  }

  it('performs a search with defaults and returns results', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => successResult }))

    const results = await getSearchResultsWithFacets('foo')
    expect(results).toEqual([{
      totalHits: 2,
      results: [{
        uri: 'http://platform:8080/repository/cornell/f2b0291d-b679-4560-bd03-d3eb3b6fa187',
        label: 'foo',
        created: '2019-11-27T19:05:48.496Z',
        modified: '2019-11-27T19:05:48.496Z',
        type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
        group: 'cornell',
      }, {
        uri: 'http://platform:8080/repository/duke/718e77f1-a07d-4579-ad56-0c93bd3067ea',
        label: 'bar',
        created: '2019-11-27T19:07:03.643Z',
        modified: '2019-11-27T19:07:03.643Z',
        type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
        group: 'duke',
      }],
    }, {
      types: [{
        key: 'http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle',
        doc_count: 2,
      }],
      groups: [{
        key: 'cornell',
        doc_count: 1,
      }, {
        key: 'duke',
        doc_count: 1,
      }],
    }])
    const body = {
      query: {
        bool: {
          must: {
            simple_query_string: {
              fields: ['title^3', 'subtitle^2', 'uri^3', 'text'],
              default_operator: 'AND',
              query: 'foo',
            },
          },
        },
      },
      from: 0,
      size: 10,
      sort: ['_score'],
      aggs: {
        types: {
          terms: {
            field: 'type',
          },
        },
        groups: {
          terms: {
            field: 'group',
          },
        },
      },
    }
    expect(global.fetch).toHaveBeenCalledWith('/api/search/sinopia_resources/sinopia/_search', { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method: 'POST' })
  })

  it('performs a search with specified filters and no aggs and returns results', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => successResult }))

    await getSearchResultsWithFacets('foo', {
      typeFilter: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
      groupFilter: ['cornell'],
      noFacetResults: true,
    })
    const body = {
      query: {
        bool: {
          must: {
            simple_query_string: {
              fields: ['title^3', 'subtitle^2', 'uri^3', 'text'],
              default_operator: 'AND',
              query: 'foo',
            },
          },
          filter: [{
            terms: {
              type: ['http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle'],
            },
          }, {
            terms: {
              group: ['cornell'],
            },
          }],
        },
      },
      from: 0,
      size: 10,
      sort: ['_score'],
    }
    expect(global.fetch).toHaveBeenCalledWith('/api/search/sinopia_resources/sinopia/_search', { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method: 'POST' })
  })
})

describe('getLookupResults', () => {
  const lookupConfigs = findAuthorityConfigs([
    'urn:ld4p:sinopia:bibframe:instance',
    'urn:ld4p:sinopia:bibframe:work',
  ])
  const instanceResult = {
    took: 5,
    timed_out: false,
    _shards: {
      total: 5,
      successful: 5,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: 0,
      max_score: null,
      hits: [],
    },
  }

  const workResult = {
    took: 12,
    timed_out: false,
    _shards: {
      total: 5,
      successful: 5,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: 1,
      max_score: 0.53412557,
      hits: [
        {
          _index: 'sinopia_resources',
          _type: 'sinopia',
          _id: 'repository/cornell/3519e138-0f07-46a6-bd82-d4804c3b4890',
          _score: 0.53412557,
          _source: {
            uri: 'http://platform:8080/repository/cornell/3519e138-0f07-46a6-bd82-d4804c3b4890',
            title: [
              'Foo',
            ],
            label: 'Foo',
            text: [
              'Foo',
            ],
            created: '2019-11-03T15:04:18.015Z',
            modified: '2019-11-03T15:04:18.015Z',
            type: [
              'http://id.loc.gov/ontologies/bibframe/Work',
            ],
          },
        },
      ],
    },
  }

  it('performs a search and returns result', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ json: () => instanceResult }))
      .mockImplementationOnce(() => Promise.resolve({ json: () => workResult }))

    const results = await Promise.all(getLookupResults('foo', lookupConfigs))
    expect(results).toEqual([{
      totalHits: 0,
      results: [],
      authLabel: 'Sinopia BIBFRAME instance resources',
      authURI: 'urn:ld4p:sinopia:bibframe:instance',
      label: 'Sinopia BIBFRAME instance resources',
      id: 'urn:ld4p:sinopia:bibframe:instance',
    }, {
      totalHits: 1,
      results: [{
        uri: 'http://platform:8080/repository/cornell/3519e138-0f07-46a6-bd82-d4804c3b4890',
        label: 'Foo',
        created: '2019-11-03T15:04:18.015Z',
        modified: '2019-11-03T15:04:18.015Z',
        type: ['http://id.loc.gov/ontologies/bibframe/Work'],
      }],
      authLabel: 'Sinopia BIBFRAME work resources',
      authURI: 'urn:ld4p:sinopia:bibframe:work',
      label: 'Sinopia BIBFRAME work resources',
      id: 'urn:ld4p:sinopia:bibframe:work',
    }])
  })
})
