import React from 'react';
import EditableWrapper from './EditableWrapper';

// This wrapper provides isEditMode context to existing EditableWrapper components
// It gets the edit mode state from the SuperWebsiteEditor context
const EditableSectionWrapper = ({ children, elementPath, elementType, content, setContent }) => {
  // For now, we'll pass false to isEditMode since SuperWebsiteEditor handles the editing
  // This maintains compatibility with existing components
  return (
    <EditableWrapper
      isEditMode={false}
      elementPath={elementPath}
      elementType={elementType}
      content={content}
      setContent={setContent}
    >
      {children}
    </EditableWrapper>
  );
};

export default EditableSectionWrapper;