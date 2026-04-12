import { QueryClient } from "@tanstack/react-query";
import { getTemplateById, getTemplateDemoData } from "@/api/templates";
import { preloadTemplate } from "@/templates";

const warmedTemplateIds = new Set<string>();

export const warmTemplateExperience = (
  queryClient: QueryClient,
  templateId: string | number,
) => {
  const id = String(templateId);
  if (warmedTemplateIds.has(id)) return;

  warmedTemplateIds.add(id);

  preloadTemplate(id);
  void import("@/pages/TemplateDemoPage");

  void queryClient.prefetchQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplateById(id),
    staleTime: 5 * 60 * 1000,
  });

  void queryClient.prefetchQuery({
    queryKey: ["template-demo", id],
    queryFn: () => getTemplateDemoData(id),
    staleTime: 5 * 60 * 1000,
  });
};
