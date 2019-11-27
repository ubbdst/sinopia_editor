// Copyright 2018, 2019 Stanford University see LICENSE for license

import N3Parser from 'n3/lib/N3Parser'
import N3Writer from 'n3/lib/N3Writer'
import rdf from 'rdf-ext'
import _ from 'lodash'
import Config from 'Config'
import CryptoJS from 'crypto-js'
import Stream from 'stream'

export const defaultLanguageId = 'eng'

export const isResourceWithValueTemplateRef = property => property?.type === 'resource'
    && property?.valueConstraint?.valueTemplateRefs?.length > 0

export const groupName = (uri) => {
  const groupSlug = uri.split('/')[4]
  return Config.groupsInSinopia[groupSlug]
}

export const resourceToName = (uri) => {
  if (!_.isString(uri)) return undefined

  return uri.substr(uri.lastIndexOf('/') + 1)
}

export const isValidURI = (value) => {
  try {
    /* eslint no-new: 'off' */
    new URL(value)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Loads N3 into a dataset.
 * @param {string} data that is the N3
 * @return {Promise<rdf.Dataset>} a promise that resolves to the loaded dataset
 */
export const rdfDatasetFromN3 = data => new Promise((resolve, reject) => {
  const parser = new N3Parser({ factory: rdf })
  const dataset = rdf.dataset()
  parser.parse(data,
    (err, quad) => {
      if (err) {
        reject(err)
      }
      // the final time through this loop will be EOF and quad will be undefined
      if (quad) {
        dataset.add(quad)
      } else {
        // done parsing
        resolve(dataset)
      }
    })
})

export const turtleFromDataset = (dataset) => {
  const ttlParts = []
  const writableStream = new Stream.Writable()
  writableStream._write = (chunk, encoding, next) => {
    ttlParts.push(chunk.toString())
    next()
  }
  const writer = new N3Writer(writableStream, { end: false })
  dataset.toArray().forEach(quad => writer.addQuad(quad))
  writer.end()
  return ttlParts.join('')
}

export const generateMD5 = message => CryptoJS.MD5(message).toString()
