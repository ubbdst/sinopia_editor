// Copyright 2019 Stanford University see LICENSE for license

import React from 'react'
import { shallow } from 'enzyme'
import ResourceTemplate from 'components/editor/ResourceTemplate'
import ResourceTemplateForm from 'components/editor/ResourceTemplateForm'
import Alerts from 'components/Alerts'

describe('<ResourceTemplate />', () => {
  const resourceTemplate = {
    resourceLabel: 'BF2 Work',
  }
  const wrapper = shallow(<ResourceTemplate.WrappedComponent resourceTemplateId="resourceTemplate:bf2:Note"
                                                             resourceTemplate={resourceTemplate}
                                                             retrieveResourceTemplate={jest.fn()}
                                                             unusedRDF="foo"
                                                             errors={['Oooops']} />)

  it('has div with class "ResourceTemplate"', () => {
    expect(wrapper.find('div.ResourceTemplate').length).toEqual(1)
  })

  it('displays the resource label of the resource template', () => {
    expect(wrapper.find('#resourceTemplate h3').text()).toEqual('BF2 Work')
  })

  // TODO: if we have more than one resourceTemplate form, they need to have unique ids (see #130)
  it('contains <div> with id resourceTemplate', () => {
    expect(wrapper.find('div#resourceTemplate').length).toEqual(1)
  })

  it('renders ResourceTemplateForm', () => {
    expect(wrapper.find(ResourceTemplateForm).length).toEqual(1)
  })

  it('displays the unused RDF', () => {
    expect(wrapper.find('div.alert-warning').text()).toMatch(/Unable to load the entire resource./)
  })

  it('displays Alert', () => {
    expect(wrapper.find(Alerts).length).toEqual(2)
  })

  describe('When there is an error and no resource template', () => {
    const alertWrapper = shallow(<ResourceTemplate.WrappedComponent errors={['Oooops']} />)
    it('displays Alert', () => {
      expect(alertWrapper.find(Alerts).length).toEqual(1)
    })

    it('does not display the resource', () => {
      expect(alertWrapper.find('div.ResourceTemplate').length).toEqual(0)
    })
  })
})
