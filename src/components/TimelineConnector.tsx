import React from 'react';

type TimelineConnectorProps = {
  fromPosition: number;
  toPosition: number;
  orientation: 'horizontal' | 'vertical';
};

export default function TimelineConnector({
  fromPosition,
  toPosition,
  orientation,
}: TimelineConnectorProps): React.ReactElement {
  const style: React.CSSProperties =
    orientation === 'horizontal'
      ? {
          position: 'absolute',
          left: fromPosition,
          width: toPosition - fromPosition,
        }
      : {
          position: 'absolute',
          top: fromPosition,
          height: toPosition - fromPosition,
        };

  return <div className={`timeline-connector ${orientation}`} style={style} />;
}
