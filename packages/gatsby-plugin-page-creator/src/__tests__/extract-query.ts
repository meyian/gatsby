import { generateQueryFromString, reverseLookupParams } from "../extract-query"
import path from "path"

// windows and mac have different seperators, all code is written with unix-like
// file systems, but the underlying code uses `path.sep`. So when running tests
// on windows, they would fail without us swapping the seperators.
const compatiblePath = (filepath: string): string =>
  filepath.replace(`/`, path.sep)

describe(`extract query`, () => {
  describe(`root query string`, () => {
    it(`basic example`, () => {
      expect(
        generateQueryFromString(`Thing`, compatiblePath(`/foo/bar/{id}.js`))
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`all example`, () => {
      expect(
        generateQueryFromString(`allThing`, compatiblePath(`/foo/bar/{id}.js`))
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`all example with arguments`, () => {
      expect(
        generateQueryFromString(
          `allThing(filter: { main_url: { nin: [] }})`,
          compatiblePath(`/foo/bar/{id}.js`)
        )
      ).toBe(`{allThing(filter: { main_url: { nin: [] }}){nodes{id}}}`)
    })

    it(`supports a special fragment`, () => {
      expect(
        generateQueryFromString(
          `allMarkdownRemark {
        group(field: frontmatter___topic) {
            ...CollectionPagesQueryFragment
        }
    }`,
          compatiblePath(`/foo/bar/{frontmatter__topic}.js`)
        )
      ).toEqual(`allMarkdownRemark {
        group(field: frontmatter___topic) {
            nodes{frontmatter{topic}}
        }
    }`)
    })
  })

  describe(`filepath resolution`, () => {
    it(`basic example`, () => {
      expect(
        generateQueryFromString(`Thing`, compatiblePath(`/foo/bar/{id}.js`))
      ).toBe(`{allThing{nodes{id}}}`)
    })

    it(`multiple nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{id}/{name}.js`)
        )
      ).toBe(`{allThing{nodes{id,name}}}`)
    })

    it(`nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{id}/{fields__name}.js`)
        )
      ).toBe(`{allThing{nodes{id,fields{name}}}}`)
    })

    it(`deeply nested nodes`, () => {
      expect(
        generateQueryFromString(
          `Thing`,
          compatiblePath(`/foo/bar/{id}/{fields__name__thing}.js`)
        )
      ).toBe(`{allThing{nodes{id,fields{name{thing}}}}}`)
    })
  })
})

describe(`reverseLookupParams`, () => {
  it(`handles single depth items`, () => {
    expect(
      reverseLookupParams(
        { id: `foo`, otherProp: `bar` },
        compatiblePath(`/{id}.js`)
      )
    ).toEqual({
      id: `foo`,
    })
  })

  it(`handles multiple depth items`, () => {
    expect(
      reverseLookupParams(
        { fields: { name: `foo` } },
        compatiblePath(`/{fields__name}.js`)
      )
    ).toEqual({
      fields__name: `foo`,
    })
  })
})