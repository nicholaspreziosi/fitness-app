import { nativeTabTriggers } from '@/src/ui/shared/navigation/nativeTabTriggers';

describe('nativeTabTriggers', () => {
  it('lists the five tabs in order with SF Symbols and Material icons', () => {
    expect(nativeTabTriggers).toEqual([
      {
        name: 'home',
        label: 'Dashboard',
        sf: { default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' },
        md: 'dashboard',
      },
      {
        name: 'calendar',
        label: 'Calendar',
        sf: 'calendar',
        md: 'calendar_month',
      },
      {
        name: 'workout',
        label: 'Workout',
        sf: { default: 'checkmark.circle', selected: 'checkmark.circle.fill' },
        md: 'check_circle',
      },
      {
        name: 'library',
        label: 'Library',
        sf: { default: 'dumbbell', selected: 'dumbbell.fill' },
        md: 'fitness_center',
      },
      {
        name: 'settings',
        label: 'Settings',
        sf: { default: 'gearshape', selected: 'gearshape.fill' },
        md: 'settings',
      },
    ]);
  });
});
