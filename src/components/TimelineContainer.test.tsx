import React from 'react';
import { render, screen } from '@testing-library/react';
import TimelineContainer from './TimelineContainer';

describe('TimelineContainer', () => {
  it('renders children', () => {
    render(
      <TimelineContainer orientation="horizontal">
        <span>child content</span>
      </TimelineContainer>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('applies horizontal class', () => {
    const { container } = render(
      <TimelineContainer orientation="horizontal">
        <span />
      </TimelineContainer>,
    );
    expect(container.firstChild).toHaveClass('timeline-container');
    expect(container.firstChild).toHaveClass('horizontal');
    expect(container.firstChild).not.toHaveClass('vertical');
  });

  it('applies vertical class', () => {
    const { container } = render(
      <TimelineContainer orientation="vertical">
        <span />
      </TimelineContainer>,
    );
    expect(container.firstChild).toHaveClass('timeline-container');
    expect(container.firstChild).toHaveClass('vertical');
    expect(container.firstChild).not.toHaveClass('horizontal');
  });

  it('renders multiple children', () => {
    render(
      <TimelineContainer orientation="horizontal">
        <div data-testid="child-a" />
        <div data-testid="child-b" />
      </TimelineContainer>,
    );
    expect(screen.getByTestId('child-a')).toBeInTheDocument();
    expect(screen.getByTestId('child-b')).toBeInTheDocument();
  });
});
