import React from 'react';
import DocsMVP from './DocsMVP';

export default function App() {
  // For simplicity, we are directly rendering the editor for a new document.
  // The concept of a "document list" has been removed for this implementation.
  return <DocsMVP />;
}
