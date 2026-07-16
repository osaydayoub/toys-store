import { readFile } from "fs/promises";
import { Resend } from "resend";

const isRemotePath = (path) => /^https?:\/\//i.test(path);

const prepareAttachment = async ({ cid, contentId, path, ...attachment }) => {
  const preparedAttachment = {
    ...attachment,
    ...(contentId || cid ? { contentId: contentId || cid } : {}),
  };

  if (!path) {
    return preparedAttachment;
  }

  if (isRemotePath(path)) {
    return { ...preparedAttachment, path };
  }

  return {
    ...preparedAttachment,
    content: await readFile(path),
  };
};

const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments = [],
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const preparedAttachments = await Promise.all(
    attachments.map(prepareAttachment)
  );

  const { data, error } = await resend.emails.send({
    from:
      process.env.EMAIL_FROM ||
      "Baby Kids Toys <no-reply@firststeptoys.com>",
    to,
    subject,
    text,
    html,
    attachments: preparedAttachments,
  });

  if (error) {
    console.error("Failed to send email with Resend:", error);
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};

export default sendEmail;
