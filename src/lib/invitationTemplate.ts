import { getTemplateEditorId, getTemplateMetadata } from "@/templates";

type InvitationLike = {
  templateId?: string | number | null;
  templateTheme?: string | null;
  template?: {
    id?: string | number | null;
    name?: string | null;
    themeKey?: string | null;
    slug?: string | null;
  } | null;
  invitationData?: {
    custom_template_key?: string | null;
    custom_template_name?: string | null;
    base_template_id?: string | number | null;
  } | null;
};

export const getInvitationTemplateKey = (invitation?: InvitationLike | null) => {
  if (!invitation) return "crimson";

  return (
    invitation.invitationData?.custom_template_key ||
    invitation.template?.slug ||
    invitation.template?.themeKey ||
    invitation.templateTheme ||
    (invitation.template?.id != null ? String(invitation.template.id) : null) ||
    (invitation.templateId != null ? String(invitation.templateId) : null) ||
    "crimson"
  );
};

export const getInvitationTemplateName = (
  invitation?: InvitationLike | null,
) => {
  if (!invitation) return "Template";

  return (
    invitation.invitationData?.custom_template_name ||
    invitation.template?.name ||
    getTemplateMetadata(getInvitationTemplateKey(invitation))?.name ||
    "Template"
  );
};

export const getInvitationEditorTemplateId = (
  invitation?: InvitationLike | null,
) => {
  if (!invitation) return "1";

  const customKey = invitation.invitationData?.custom_template_key;
  if (customKey) {
    return (
      getTemplateEditorId(customKey) ||
      (invitation.invitationData?.base_template_id != null
        ? String(invitation.invitationData.base_template_id)
        : null) ||
      (invitation.template?.id != null ? String(invitation.template.id) : null) ||
      (invitation.templateId != null ? String(invitation.templateId) : null) ||
      "1"
    );
  }

  return (
    (invitation.template?.id != null ? String(invitation.template.id) : null) ||
    (invitation.templateId != null ? String(invitation.templateId) : null) ||
    "1"
  );
};

export const isCustomInvitationTemplate = (
  invitation?: InvitationLike | null,
) => Boolean(invitation?.invitationData?.custom_template_key);
