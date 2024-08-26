import React from 'react'
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const MarkdownRenderer = ({ markdown }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath, gfm]}
            rehypePlugins={[rehypeKatex]}
        >
            {markdown}
        </ReactMarkdown>
    )
}

export default MarkdownRenderer