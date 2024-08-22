import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import remarkGfm from 'remark-gfm'; // for GitHub Flavored Markdown
import remarkMath from 'remark-math';
// import 'katex/dist/katex.min.css';

const MarkdownRenderer = ({ markdown }) => {
    return (
        <MathJaxContext>
        <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
                math: ({ value }) => {
                    return <MathJax dynamic hideUntilTypeset="every" >{`${value}`}</MathJax>;
                },
                blockmath: ({ value }) => {
                    return <MathJax dynamic hideUntilTypeset="every" >{`${value}`}</MathJax>;
                },
            }}
        >
            {markdown}
        </ReactMarkdown>
        </MathJaxContext>
  );
};

export default MarkdownRenderer;
