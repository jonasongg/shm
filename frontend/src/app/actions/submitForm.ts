"use server";

import { toAbsoluteUrl } from "@/lib/utils";

export const submitForm = async (
  state: { message: string; success: boolean },
  formData: FormData,
) => {
  console.log("submitted");
  const name = formData.get("name")?.toString;
  if (!name) {
    return { message: "Name cannot be empty!", success: false };
  }

  const response = await fetch(toAbsoluteUrl("/vm"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return {
      message: "Failed to send message. Please try again later.",
      success: false,
    };
  }

  return { message: "Message sent successfully!", success: true };
};
