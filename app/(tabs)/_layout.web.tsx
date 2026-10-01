import { tabsInitialRouteName } from '@/src/ui/shared/navigation/nativeTabTriggers';
import { TabShell } from '@/src/ui/shared/navigation/TabShell';
import { WebTabBar } from '@/src/ui/shared/navigation/WebTabBar';

export const unstable_settings = {
  initialRouteName: tabsInitialRouteName,
};

export default function TabsLayout() {
  return (
    <TabShell>
      <WebTabBar />
    </TabShell>
  );
}
