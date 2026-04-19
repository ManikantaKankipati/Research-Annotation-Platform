import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin, MessageIcon } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { createAnnotation } from '../api/paperApi';

const PdfViewer = ({ fileUrl, annotations = [], paperId }) => {
  const [message, setMessage] = useState('');
  
  const renderHighlightTarget = (props) => (
    <div
      className="absolute bg-indigo-600 text-white p-2 rounded-lg shadow-xl cursor-pointer z-50 flex items-center gap-2 animate-in slide-in-from-bottom-2"
      style={{
        left: `${props.selectionRegion.left}%`,
        top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
      }}
      onClick={() => {
        const content = window.prompt('Add a comment to this highlight:');
        if (content !== null) {
          props.toggle();
          handleAnnotate(props.selectionRegion, content);
        }
      }}
    >
      <MessageIcon />
      <span className="text-xs font-bold">Annotate</span>
    </div>
  );

  const handleAnnotate = async (selectionRegion, content) => {
    const newAnn = {
      paperId,
      userId: '65f1a2b3c4d5e6f7a8b9c0d1', // Mock user ID
      type: 'comment',
      content,
      position: {
        pageNumber: selectionRegion.pageIndex + 1,
        boundingRect: {
          x1: selectionRegion.left,
          y1: selectionRegion.top,
          x2: selectionRegion.left + selectionRegion.width,
          y2: selectionRegion.top + selectionRegion.height
        }
      }
    };
    try {
      await createAnnotation(newAnn);
    } catch (err) {
      console.error('Failed to create annotation', err);
    }
  };

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
  });

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="h-full w-full bg-slate-800 overflow-hidden flex flex-col">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="flex-1 overflow-auto">
          <Viewer
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance, highlightPluginInstance]}
          />
        </div>
      </Worker>
    </div>
  );
};

export default PdfViewer;
