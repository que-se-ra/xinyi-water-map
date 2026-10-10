'use client';

// 目前專案：由路由（/[project]）決定。沒有包 provider 的頁面（後台等）退回預設專案，
// 與 LocaleProvider 同一個道理：預設值形狀要完整，不能讓呼叫端整頁炸掉。

import { createContext, useContext } from 'react';
import { DEFAULT_PROJECT_SLUG, getProject } from './registry';

const ProjectContext = createContext(getProject(DEFAULT_PROJECT_SLUG));

// 傳 slug 而不是整個專案物件：路線資料很大，不要經過 server→client 的序列化再送一次。
export function ProjectProvider({ slug, children }) {
  const project = getProject(slug) || getProject(DEFAULT_PROJECT_SLUG);
  return <ProjectContext.Provider value={project}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  return useContext(ProjectContext);
}
