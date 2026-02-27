import React from 'react';

type TimelineContainerProps = {
  children: React.ReactNode;
  orientation: 'horizontal' | 'vertical';
};

export default function TimelineContainer({
  children,
  orientation,
}: TimelineContainerProps): React.ReactElement {
  return (
    <div className={`timeline-container ${orientation}`}>
      {children}
    </div>
  );
}
