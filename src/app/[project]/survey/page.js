import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ProjectProvider } from '@/projects/ProjectProvider';
import { PROJECTS, getProject } from '@/projects/registry';
import { projectMetadata } from '@/projects/metadata';
import SurveyPage from '@/components/SurveyPage';

// 只有登記在 registry 的專案才有網址；其他一律 404。
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.filter((p) => p.status === 'active' && p.features.survey).map((p) => ({ project: p.slug }));
}

export async function generateMetadata({ params }) {
  const project = getProject((await params).project);
  return project ? projectMetadata(project, 'zh', 'survey') : {};
}

export default async function Page({ params }) {
  const project = getProject((await params).project);
  if (!project || project.status !== 'active') notFound();
  return (
    <LocaleProvider locale="zh">
      <ProjectProvider slug={project.slug}>
        <SurveyPage />
      </ProjectProvider>
    </LocaleProvider>
  );
}
