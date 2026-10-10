import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ProjectProvider } from '@/projects/ProjectProvider';
import { PROJECTS, getProject } from '@/projects/registry';
import { projectMetadata } from '@/projects/metadata';
import HomeApp from '@/components/HomeApp';
import ComingSoonPage from '@/components/ComingSoonPage';
import { projectCard } from '@/projects/cards';

// 只有登記在 registry 的專案才有網址；其他一律 404。
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ project: p.slug }));
}

export async function generateMetadata({ params }) {
  const project = getProject((await params).project);
  if (!project) return {};
  // 籌備中的專案不給搜尋引擎收錄
  if (project.status !== 'active') {
    const card = projectCard(project.slug, 'zh');
    return { title: card.name, robots: { index: false, follow: false } };
  }
  return projectMetadata(project, 'zh');
}

export default async function Page({ params }) {
  const project = getProject((await params).project);
  if (!project) notFound();
  if (project.status !== 'active') {
    return (
      <LocaleProvider locale="zh">
        <ComingSoonPage card={projectCard(project.slug, 'zh')} />
      </LocaleProvider>
    );
  }
  return (
    <LocaleProvider locale="zh">
      <ProjectProvider slug={project.slug}>
        <HomeApp />
      </ProjectProvider>
    </LocaleProvider>
  );
}
