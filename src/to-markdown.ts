import safe from 'mdast-util-to-markdown/lib/util/safe'

interface ToMarkdownOptions {
  aliasDivider?: string;
  convertToLink?: boolean;
  removeLinkIfNotExists?: boolean;
}

function toMarkdown (opts: ToMarkdownOptions = {}) {
  const aliasDivider = opts.aliasDivider || ':'
  const convertToLink = !!opts.convertToLink
  const removeLinkIfNotExists = !!opts.removeLinkIfNotExists

  const unsafe = [
    {
      character: '[',
      inConstruct: ['phrasing', 'label', 'reference']
    },
    {
      character: ']',
      inConstruct: ['label', 'reference']
    }
  ]

  function handler (node: any, _: any, context: any) {
    const exit = context.enter('wikiLink')

    const nodeValue = safe(context, node.value, { before: '[', after: ']' })
    const nodeAlias = safe(context, node.data.alias, { before: '[', after: ']' })

    let value
    if (removeLinkIfNotExists && !node.data.exists) {
      value = nodeAlias
    } else if (convertToLink) {
      value = `[${nodeAlias}](${node.data.hProperties.href})`
    } else {
      value = generateWikiLink(nodeValue, nodeAlias, aliasDivider)
    }

    exit()

    return value
  }

  return {
    unsafe: unsafe,
    handlers: {
      wikiLink: handler
    }
  }
}

function generateWikiLink(
  nodeValue: string,
  nodeAlias: string,
  aliasDivider: string
): string {
  if (nodeAlias !== nodeValue) {
    return `[[${nodeValue}${aliasDivider}${nodeAlias}]]`
  } else {
    return `[[${nodeValue}]]`
  }
}

export { toMarkdown }
