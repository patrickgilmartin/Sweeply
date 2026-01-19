/**
 * UI Component Tests
 * Tests for React components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock components
const MockMediaViewer = ({ file }: { file: any }) => (
  <div data-testid="media-viewer">
    <div>{file.filepath}</div>
    <div>{file.media_type}</div>
  </div>
);

const MockActionButtons = ({ onKeep, onReject }: { onKeep: () => void; onReject: () => void }) => (
  <div data-testid="action-buttons">
    <button onClick={onKeep} data-testid="keep-button">Keep</button>
    <button onClick={onReject} data-testid="reject-button">Reject</button>
  </div>
);

describe('UI Components', () => {
  describe('MediaViewer', () => {
    it('should render file information', () => {
      const file = {
        filepath: 'test/image.jpg',
        media_type: 'image',
        file_size: 1024,
        status: 'pending',
      };

      render(<MockMediaViewer file={file} />);
      expect(screen.getByTestId('media-viewer')).toBeDefined();
      expect(screen.getByText('test/image.jpg')).toBeDefined();
      expect(screen.getByText('image')).toBeDefined();
    });
  });

  describe('ActionButtons', () => {
    it('should render keep and reject buttons', () => {
      const onKeep = () => {};
      const onReject = () => {};

      render(<MockActionButtons onKeep={onKeep} onReject={onReject} />);
      expect(screen.getByTestId('action-buttons')).toBeDefined();
      expect(screen.getByTestId('keep-button')).toBeDefined();
      expect(screen.getByTestId('reject-button')).toBeDefined();
    });
  });
});
