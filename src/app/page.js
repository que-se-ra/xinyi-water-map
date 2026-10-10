import { LocaleProvider } from '@/i18n/LocaleProvider';
import PlatformHome from '@/components/PlatformHome';
import { projectCards } from '@/projects/cards';

export default function Page() {
  return (
    <LocaleProvider locale="zh">
      <PlatformHome cards={projectCards('zh')} />
    </LocaleProvider>
  );
}
