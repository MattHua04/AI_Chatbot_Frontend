import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';

const MarkdownRenderer = ({ content }) => {
  // Use MathJax for LaTeX rendering
  return (
    <MathJaxContext>
      <ReactMarkdown 
        remarkPlugins={[remarkMath]}
        components={{
          math: ({ value }) => (
            <MathJax inline>{`\\(${value}\\)`}</MathJax>
          ),
          blockmath: ({ value }) => (
            <MathJax block>{`\\[${value}\\]`}</MathJax>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </MathJaxContext>
  );
};

export default MarkdownRenderer;
