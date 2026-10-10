import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ProjectProvider } from '@/projects/ProjectProvider';
import HomeApp from '@/components/HomeApp';

export default function Page() {
  return (
    <LocaleProvider locale="zh">
      <ProjectProvider slug="xinyi">
        <HomeApp />
      </ProjectProvider>
    </LocaleProvider>
  );
}
