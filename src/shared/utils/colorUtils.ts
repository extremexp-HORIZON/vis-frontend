const basePalette = ['#1f77b4', '#2ca02c']; // First two preferred colors

export function generateColor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export function getClassColorMap(classes: string[]): Record<string, string> {
  return classes.reduce((acc, cls, idx) => {
    if (idx < basePalette.length) {
      acc[cls] = basePalette[idx];
    } else {
      acc[cls] = generateColor(idx - basePalette.length);
    }
    return acc;
  }, {} as Record<string, string>);
}
