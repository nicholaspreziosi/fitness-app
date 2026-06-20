const MockComponent = () => null;

module.exports = {
  PolarChart: MockComponent,
  Pie: {
    Chart: MockComponent,
  },
  CartesianChart: ({
    children,
  }: {
    children?: (args: {
      points: { count: unknown[] };
      chartBounds: Record<string, number>;
    }) => unknown;
  }) => children?.({ points: { count: [] }, chartBounds: {} }),
  HorizontalBar: MockComponent,
};
