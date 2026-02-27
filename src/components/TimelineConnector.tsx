import React from 'react';

type TimelineConnectorProps = {
  fromPosition: number;
  toPosition: number;
  orientation: 'horizontal' | 'vertical';
};

export function getTimelineConnectorStyle(
  fromPosition: number,
  toPosition: number,
  orientation: 'horizontal' | 'vertical',
): React.CSSProperties {
  if (orientation === 'horizontal') {
    return {
      position: 'absolute',
      left: fromPosition,
      width: toPosition - fromPosition,
    };
  }
  return {
    position: 'absolute',
    top: fromPosition,
    height: toPosition - fromPosition,
  };
}

export default function TimelineConnector({
  fromPosition,
  toPosition,
  orientation,
}: TimelineConnectorProps): React.ReactElement {
  const style = getTimelineConnectorStyle(fromPosition, toPosition, orientation);
  return <div className={`timeline-connector ${orientation}`} style={style} />;
}
